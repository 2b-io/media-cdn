import parseDomain from 'parse-domain'

const isMatch = (origin, domain) => {
  const pattern = origin
    .replace(/\./g, '\\.')
    .replace(/\*/g, '(.+)')

  const regex = new RegExp(pattern)

  return regex.test(domain)
}

export default (req, res, next) => {
  const { src } = req.query
  const { project } = req._args

  const parsed = parseDomain(src)

  const domain = [
    parsed.subdomain,
    parsed.domain,
    parsed.tld
  ].filter(Boolean).join('.')

  const allowOrigin = project.origins.some(o => isMatch(o, domain))

  if (!allowOrigin) {
    // return next(new Error('invalid origin'))
    return next()
  }

  req._args.src = src

  next()
}
