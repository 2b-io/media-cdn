import s3 from 'infrastructure/s3'

export default (req, res, next) => {
  const { _media:media, _meta:meta } = req

  if (meta) {
    return next()
  }

  s3.meta(`media/${media.state.target || media.state.source}`)
    .then(meta => {
      req._meta = meta

      next()
    })
    .catch(() => next())
}
