import cache from 'services/cache'
import config from 'infrastructure/config'
import staticPath from 'services/static-path'

export default function respondTarget(req, res, next) {
  let meta, fileRespond
  const { ContentLength: sizeOrigin } = req._originMeta
  const { ContentLength: sizeTarget } = req._targetMeta

  if (sizeTarget > sizeOrigin) {
    fileRespond = req._params.origin
    meta = req._originMeta
    // Remove file optimize
    const targetKey = `${ config.version }/${ req._params.target }`
    cache.delete([ { key: targetKey} ])
  } else {
    fileRespond = req._params.target
    meta = req._targetMeta
  }

  if (!meta) {
    return next({
      status: 500,
      reason: 'Optimize target failed'
    })
  }

  console.log(`PIPE_TARGET ${ fileRespond }`)

  res.set('accept-ranges', meta.AcceptRanges)
  res.set('content-type', meta.ContentType)
  res.set('content-length', meta.ContentLength)
  res.set('last-modified', meta.LastModified)
  res.set('etag', meta.ETag)
  res.set('cache-control', `max-age=${ req._params.cacheSetting.ttl }`)

  res.set('x-origin-path', staticPath.origin(req._params))
  res.set('x-target-path', staticPath.target(req._params))

  cache.stream(fileRespond)
    .on('error', (error) => {
      return next({
        statusCode: 500,
        reason: error
      })
    })
    .pipe(res)
}
