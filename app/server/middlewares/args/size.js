const SUPPORTED_MODES = [ 'cover', 'contain', 'crop' ]

export default (req, res, next) => {
  const height = (
    (req.query && (req.query.h || req.query.height)) ||
    (req.body && (req.body.h || req.body.height)) ||
    (req.params && req.params.h) ||
    'auto'
  )
  const width = (
    (req.query && (req.query.w || req.query.width)) ||
    (req.body && (req.body.w || req.body.width)) ||
    (req.params && req.params.w) ||
    'auto'
  )
  const mode = (
    (req.query && (req.query.m || req.query.mode)) ||
    (req.body && (req.body.m || req.body.mode)) ||
    (req.params && req.params.m) ||
    ''
  ).toLowerCase()

  req._args = {
    ...req._args,
    height: height === 'auto' ? height : parseInt(height, 10),
    width: width === 'auto' ? width : parseInt(width, 10),
    mode: SUPPORTED_MODES.includes(mode) ? mode : SUPPORTED_MODES[0]
  }

  next()
}
