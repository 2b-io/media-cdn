export default (req, res, next) => {
  const { src } = req.query

  req._args = { ...req._args, src }

  next()
}
