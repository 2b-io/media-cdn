import mime from 'mime'

import cache from 'services/cache'

export default [
  async function checkExistOrigin(req, res, next) {
    if (req.query.f) {
      return next()
    }

    console.log(`HEAD ${ req._params.origin }`)

    try {
      req._originMeta = await cache.head(req._params.origin)
    } catch (error) {
      console.log(`NOTFOUND ${ req._params.origin }`)
    }

    next()
  },
  async function crawObject(req, res, next) {
    if (req._originMeta) {
      return next()
    }

    console.log(`CRAWL ${ req._params.origin }`)
    
    const producer = req.app.get('rpc')
    producer.request()
      .content({
        job: 'crawl',
        payload: {
          url: req._params.url,
          origin: req._params.origin,
          headers:[]
        }
      })
      .waitFor(`crawl:${ req._params.origin }`)
      .sendTo('worker')
      .ttl(60e3)
      .onReply(async (error, content) => {
        if (error) {
          return next({
            statusCode: 500,
            reason: error
          })
        }

        req._meta = content

        next()
      })
      .send()
  },
  async function  invalidObject (req, res, next) {
    if (!req._originMeta) {
      return next({
        status: 500,
        reason: 'Worker failed to process'
      })
    }

    next()
  },
  async function getContenType (req, res, next) {
    const contentType = req._originMeta ? req._originMeta.ContentType : req._meta.contentType
    const ext = mime.getExtension(contentType)
    req._params.contentType = contentType
    req._params.ext = ext

    next()
  }
]
