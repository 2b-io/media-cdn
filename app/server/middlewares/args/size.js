const SUPPORTED_MODES = [ 'cover', 'contain', 'crop' ]

export default (req, res, next) => {
  const height = (
    (req.query && (req.query.h || req.query.height)) ||
    (req.body && (req.body.h || req.body.height)) ||
    'auto'
  )
  const width = (
    (req.query && (req.query.w || req.query.width)) ||
    (req.body && (req.body.w || req.body.width)) ||
    'auto'
  )
  const mode = (
    (req.query && (req.query.m || req.query.mode)) ||
    (req.body && (req.body.m || req.body.mode)) ||
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
