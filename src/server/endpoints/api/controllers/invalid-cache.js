import invalidCache from 'services/invalidCache'

export default (req, res, next) => {
  invalidCache(req.body.patterns)
  res.status(201).json({
    succeed: true
  })
}
