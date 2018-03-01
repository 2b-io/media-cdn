import s3 from 'infrastructure/s3'

export default (req, res, next) => {
  const { _media:media, _meta:meta } = req

  res.set('Content-Type', meta.ContentType);
  res.set('Content-Length', meta.ContentLength);
  res.set('Last-Modified', meta.LastModified);
  res.set('ETag', meta.ETag);
  res.set('Cache-Control', 'public, max-age=2592000');
  res.set('Expires', new Date(Date.now() + 2592000000).toUTCString());

  s3.receive(`media/${media.state.target || media.state.source}`)
    .pipe(res)
}
