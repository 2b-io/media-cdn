import { URL } from 'url'

const isMatch = (origin, domain) => {
  const pattern = origin
    .replace(/\./g, '\\.')
    .replace(/\*/g, '(.+)')

  const regex = new RegExp(pattern)

  return regex.test(domain)
}

export default function getUniversalSrcArg(req, res, next) {
  const src = new URL(req.query.url || req.query.src)
  const { project } = req._args

  const allowOrigin = project.origins.length === 0 || project.origins.some(o => isMatch(o, src.hostname))

  if (!allowOrigin) {
    return next(new Error('Invalid origin'))
  }

  req._args = {
    ...req._args,
    src,
    crawlable: true
  }

  next()
}
