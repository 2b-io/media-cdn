import boolean from 'boolean'

export default (req, res, next) => {
  const force = req.query.f || req.query.force || false

  req._args = {
    ...req._args,
    force: boolean(force)
  }

  next()
}
