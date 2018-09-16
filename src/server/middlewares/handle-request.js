import mime from 'mime'
import sh from 'shorthash'
import cache from 'services/cache'
import staticPath from 'services/static-path'

import retry from './utils/retry'

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
      project: { slug },
      preset: { hash, values },
      urlHash
    } = req._params

    const valueHash = sh.unique(
      JSON.stringify(
        values,
        Object.keys(values).sort()
      )
    )

    req._params.origin = `${ slug }/${ urlHash }`

    req._params.target = `${ slug }/${ urlHash }/${ hash }/${ valueHash }/${ mode }_${ width }x${ height }`

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

        req._result = content

        next()
      })
      .send()
  },
  async (req, res, next) => {
    if (req._meta) {
      return next()
    }

    if (!req._result) {
      return next({
        status: 500,
        reason: 'Worker failed to process'
      })
    }

    console.log(`HEAD AGAIN ${ req._params.target }`)

    const etag = req._result &&
      req._result.target &&
      req._result.target.meta &&
      req._result.target.meta.ETag ||
      undefined

    try {
      req._meta = await retry(8)(cache.head)(req._params.target, etag)
    } catch (error) {
      return next({
        status: 500,
        reason: 'Failed to get S3 object (Consistency Model)'
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
    res.set('cache-control', meta.CacheControl)

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
