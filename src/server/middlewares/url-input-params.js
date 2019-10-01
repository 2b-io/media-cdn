import sh from 'shorthash'

export default function parseUrlInputParams(req, res, next) {
  const { id } = req.params

  next()
}
