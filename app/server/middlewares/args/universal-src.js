import { URL } from 'url'

const isMatch = (origin, domain) => {
  const pattern = origin
    .replace(/\./g, '\\.')
    .replace(/\*/g, '(.+)')

  const regex = new RegExp(pattern)

  return regex.test(domain)
}

export default (req, res, next) => {
  const src = new URL(req.query.url || req.query.src)
  const { project } = req._args

  const allowOrigin = project.origins.length === 0 || project.origins.some(o => isMatch(o, src.hostname))

  if (!allowOrigin) {
    // return next(new Error('invalid origin'))
    return next(new Error('invalid origin'))
  }

  req._args.src = src

  next()
}
