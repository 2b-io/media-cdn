export default (req, res, next) => {
  const { src } = req._args

  res.send(src)
}
