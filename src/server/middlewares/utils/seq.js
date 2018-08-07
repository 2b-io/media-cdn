import series from 'async/series'

export default (...middlewares) => (req, res, next) => {
  series(
    middlewares.map((middleware) => (done) => middleware(req, res, done)),
    (error) => next(error)
  )
}
