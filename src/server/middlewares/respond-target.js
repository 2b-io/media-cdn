import cache, { cloudPath } from 'services/cache'
import config from 'infrastructure/config'
import staticPath from 'services/static-path'

export default async function respondTarget(req, res, next) {
  let meta = req._targetMeta
  let respondPath = req._params.target

  if (!meta) {
    return next({
      status: 500,
      reason: 'Optimize target failed'
    })
  }

  const { ContentLength: sizeOrigin } = req._originMeta
  const { ContentLength: sizeTarget } = req._targetMeta

  if (sizeTarget > sizeOrigin) {
    respondPath = req._params.origin
    meta = req._originMeta

    // Delete target file
    await cache.delete([ {
      key: cloudPath(req._params.target)
    } ])
  }

  console.log(`PIPE_TARGET ${ respondPath }`)

  res.set('accept-ranges', meta.AcceptRanges)
  res.set('content-type', meta.ContentType)
  res.set('content-length', meta.ContentLength)
  res.set('last-modified', meta.LastModified)
  res.set('etag', meta.ETag)
  res.set('cache-control', `max-age=${ req._params.cacheSetting.ttl }`)

  res.set('x-origin-path', staticPath.origin(req._params))
  res.set('x-target-path', staticPath.target(req._params))

  cache.stream(respondPath)
    .on('error', (error) => {
      return next({
        statusCode: 500,
        reason: error
      })
    })
    .pipe(res)
}
