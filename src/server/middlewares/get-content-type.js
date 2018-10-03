import mime from 'mime'

import cache from 'services/cache'

export default [
  async function createOriginPath(req, res, next) {
    if (req._params.origin || req._params.target) {
      return next()
    }

    const {
      project: { identifier },
      urlHash
    } = req._params

    req._params.origin = `${ identifier }/${ urlHash }`

    // req._params.target = `${ identifier }/${ urlHash }`

    next()
  },
  async function checkExistOrigin(req, res, next) {
    if (req.query.f) {
      return next()
    }

    console.log(`HEAD ${ req._params.origin }`)

    try {
      req._meta = await cache.head(req._params.origin)
    } catch (error) {
      console.log(`NOTFOUND ${ req._params.origin }`)
    }

    next()
  },
  async function crawObject(req, res, next) {
    if (req._meta) {
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
    if (!req._meta) {
      return next({
        status: 500,
        reason: 'Worker failed to process'
      })
    }

    next()
  },
  async function getContenType (req, res, next) {
    const ext = mime.getExtension(req._meta.contentType)
    req._params.contentType = req._meta.contentType
    req._params.ext = ext

    next()
  }
]
