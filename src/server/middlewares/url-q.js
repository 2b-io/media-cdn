import sh from 'shorthash'
import { URL } from 'url'

const isMatch = (origin, domain) => {
  const pattern = origin
    .replace(/\./g, '\\.')
    .replace(/\*/g, '(.+)')

  const regex = new RegExp(pattern)

  return regex.test(domain)
}

export default async (req, res, next) => {
  const { query } = req
  const url = query.url || query.src

  if (!url) {
    // bad request
    return next({
      status: 400,
      reason: 'URL is missing'
    })
  }

  const { hostname } = new URL(url)
  const { project } = req._params

  const allowOrigin = project.origins.length === 0 ||
    project.origins.some(
      (origin) => isMatch(origin, hostname)
    )

  if (!allowOrigin) {
    // forbidden
    return next({
      statusCode: 403,
      reason: 'Origin Forbidden'
    })
  }

  req._params = {
    ...req._params,
    url,
    urlHash: sh.unique(url)
  }

  next()
}
