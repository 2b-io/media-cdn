const SUPPORTED_MODES = [ 'cover', 'contain', 'crop' ]

export default (req, res, next) => {
  const height = req.query.h || req.query.height || 'auto'
  const width = req.query.w || req.query.width || 'auto'
  const mode = req.query.m || req.query.mode

  req._args = {
    ...req._args,
    height: height === 'auto' ? height : parseInt(height, 10),
    width: width === 'auto' ? width : parseInt(width, 10),
    mode: SUPPORTED_MODES.includes(mode) ? mode : SUPPORTED_MODES[0]
  }

  next()
}
