import mime from 'mime'
import ms from 'ms'
import sh from 'shorthash'
import cache from 'services/cache'
import staticPath from 'services/static-path'

export default [
  (req, res, next) => {
    if (req._params.origin || req._params.target) {
      return next()
    }

    const {
      args: {
        mode = 'cover',
        width = 'auto',
        height = 'auto'
      },
      project: { identifier },
      preset: { hash, values },
      urlHash
    } = req._params

    const valueHash = sh.unique(
      JSON.stringify(
        values,
        Object.keys(values).sort()
      )
    )

    req._params.origin = `${ identifier }/${ urlHash }`

    // get file goc + tim preset the content-type

    req._params.target = `${ identifier }/${ urlHash }/${ hash }/${ valueHash }/${ mode }_${ width }x${ height }`


    // req._params.target = `${ projectId }/${ urlHash }/${ presetHash }/${ mode }_${ width }x${ height }.${ ext }`

    next()
  },
  async (req, res, next) => {
    if (req.query.f) {
      return next()
    }

    console.log(`HEAD ${ req._params.target }`)

    try {
      req._meta = await cache.head(req._params.target)
    } catch (error) {
      console.log(`NOTFOUND ${ req._params.target }`)
    }

    next()
  },
  (req, res, next) => {
    if (req._meta) {
      return next()
    }

    console.log(`PROCESS ${ req._params.target }`)

    const producer = req.app.get('rpc')

    producer.request()
      .content({
        job: 'process',
        payload: {
          url: req._params.url,
          origin: req._params.origin,
          target: req._params.target,
          args: {
            ...req._params.preset.values,
            ...req._params.args
          },
          headers: req._params.project.headers
        }
      })
      .waitFor(`process:${ req._params.target }`)
      .sendTo('worker')
      .ttl(60e3)
      .onReply(async (error, content) => {
        if (error) {
          return next({
            statusCode: 500,
            reason: error
          })
        }

        req._meta = content.meta

        next()
      })
      .send()
  },
  async (req, res, next) => {
    if (!req._meta) {
      return next({
        status: 500,
        reason: 'Worker failed to process'
      })
    }

    next()
  },
  (req, res, next) => {
    const meta = req._meta

    console.log(`PIPE ${ req._params.target }`)

    const { target } = req._params
    const ext = mime.getExtension(meta.ContentType)
    const params = { ...req._params, ext }

    res.set('accept-ranges', meta.AcceptRanges)
    res.set('content-type', meta.ContentType)
    res.set('content-length', meta.ContentLength)
    res.set('last-Modified', meta.LastModified)
    res.set('etag', meta.ETag)
    res.set('cache-control', `max-age=${ ms('90d') / 1000 }`)

    res.set('x-origin-path', staticPath.origin(params))
    res.set('x-target-path', staticPath.target(params))

    cache.stream(target)
      .on('error', (error) => {
        return next({
          statusCode: 500,
          reason: error
        })
      })
      .pipe(res)
  }
]
