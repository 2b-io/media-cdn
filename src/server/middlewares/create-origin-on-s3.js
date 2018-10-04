import mime from 'mime'

import cache from 'services/cache'

export default [
  async function checkExistOrigin(req, res, next) {
    if (req.query.f) {
      return next()
    }

    console.log(`HEAD_ORIGIN ${ req._params.origin }`)

    try {
      req._originMeta = await cache.head(req._params.origin)
    } catch (error) {
      console.log(`NOTFOUND_ORIGIN ${ req._params.origin }`)
    }

    next()
  },
  async function crawlOrigin(req, res, next) {
    if (req._originMeta) {
      return next()
    }

    console.log(`CRAWL_ORIGIN ${ req._params.origin }`)

    req.app.get('rpc').request()
      .content({
        job: 'crawl',
        payload: {
          url: req._params.url,
          origin: req._params.origin,
          headers: req._params.pullSetting.headers
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

        next()
      })
      .send()
  },
  async function getOriginMeta(req, res, next) {
    if (req._originMeta) {
      return next()
    }

    console.log(`HEAD_ORIGIN ${ req._params.origin }`)

    req.app.get('rpc').request()
      .content({
        job: 'head',
        payload: {
          target: req._params.origin,
        }
      })
      .waitFor(`head:${ req._params.origin }`)
      .sendTo('worker')
      .ttl(60e3)
      .onReply(async (error, content) => {
        if (error) {
          return next({
            statusCode: 500,
            reason: error
          })
        }

        req._originMeta = content

        next()
      })
      .send()
  },
  async function getContenType(req, res, next) {
    if (!req._originMeta) {
      return next({
        status: 500,
        reason: 'Crawl origin failed'
      })
    }

    const { ContentType: contentType } = req._originMeta
    const ext = mime.getExtension(contentType)
    req._params.contentType = contentType
    req._params.ext = ext

    next()
  }
]
