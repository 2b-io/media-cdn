export default function parseArgsFromQuery(req, res, next) {
  const { query } = req

  req._params.args = {
    mode: query.m || 'cover',
    width: parseInt(query.w || query.width, 10) || undefined,
    height: parseInt(query.h || query.height, 10) || undefined
  }

  next()
}
