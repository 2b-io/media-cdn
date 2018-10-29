import sh from 'shorthash'
import { URL } from 'url'

const isMatch = (origin, domain) => {
  const pattern = origin
    .replace(/\./g, '\\.')
    .replace(/\*/g, '(.+)')

  const regex = new RegExp(pattern)

  return regex.test(domain)
}

export default function parseUrlFromQuery(req, res, next) {
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
  const { allowedOrigins } = req._params.pullSetting

  const allowOrigin = allowedOrigins.length === 0 ||
    allowedOrigins.some(
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
    hashedURL: sh.unique(url)
  }

  next()
}
