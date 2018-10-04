import mime from 'mime'
import ms from 'ms'
import sh from 'shorthash'
import cache from 'services/cache'
import staticPath from 'services/static-path'

export default function respondTarget(req, res, next) {
  if (!req._targetMeta) {
    return next({
      status: 500,
      reason: 'Optimize target failed'
    })
  }

  const meta = req._targetMeta

  console.log(`PIPE_TARGET ${ req._params.target }`)

  const { target } = req._params
  const { ext } = req._params
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
