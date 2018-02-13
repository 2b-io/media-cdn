export default (req, res, next) => {
  const { w = 'auto' } = req.query

  req._args = {
    ...req._args,
    w,
    width: w === 'auto' ?
      w :
      Math.ceil(parseInt(w, 10) / req._args.preset.values.step) * req._args.preset.values.step
  }

  next()
}
