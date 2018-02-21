export default (req, res, next) => {
  const width = req.query.w || req.query.width || 'auto'

  req._args = {
    ...req._args,
    width,
    width: width === 'auto' ?
      width :
      Math.ceil(parseInt(width, 10) / req._args.preset.values.step) * req._args.preset.values.step
  }

  next()
}
