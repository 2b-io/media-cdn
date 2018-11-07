import useragent from 'useragent'

import cache from 'services/cache'
import staticPath from 'services/static-path'

export default function respondTarget(req, res, next) {
  const meta = req._targetMeta

  if (!meta) {
    return next({
      status: 500,
      reason: 'Optimize target failed'
    })
  }

  if (meta.ContentType === 'image/webp') {
    const { firefox, ie } = useragent.is(req.headers['user-agent'])

    if (firefox || ie) {
      const originUrl = req._originMeta.Metadata[ 'origin-url' ]
      res.set('cache-control', `max-age=${ req._params.cacheSetting.ttl }`)
      res.redirect(originUrl)

      return
    }
  }

  console.log(`PIPE_TARGET ${ req._params.target }`)

  res.set('accept-ranges', meta.AcceptRanges)
  res.set('content-type', meta.ContentType)
  res.set('content-length', meta.ContentLength)
  res.set('last-modified', meta.LastModified)
  res.set('etag', meta.ETag)
  res.set('cache-control', `max-age=${ req._params.cacheSetting.ttl }`)

  res.set('x-origin-path', staticPath.origin(req._params))
  res.set('x-target-path', staticPath.target(req._params))

  cache.stream(req._params.target)
    .on('error', (error) => {
      return next({
        statusCode: 500,
        reason: error
      })
    })
    .pipe(res)
}
