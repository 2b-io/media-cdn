import s3 from 'infrastructure/s3'

export default function returnCachedMedia(req, res, next) {
  const { _media:media, _meta:meta } = req

  res.set('content-type', meta.ContentType)
  res.set('content-length', meta.ContentLength)
  res.set('last-Modified', meta.LastModified)
  res.set('etag', meta.ETag)
  res.set('cache-control', 'public, max-age=2592000')
  res.set('expires', new Date(Date.now() + 2592000000).toUTCString())

  s3.receive(`media/${media.state.target || media.state.source}`)
    .pipe(res)
}
