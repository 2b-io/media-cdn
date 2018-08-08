import querystring from 'querystring'
import sh from 'shorthash'
import { URL } from 'url'

export default async (req, res, next) => {
  const { project } = req._params

  const url = new URL(
    req.params[0] + (
      Object.keys(req.query).length ?
        '?' + querystring.stringify(req.query) : ''
    ),
    project.prettyOrigin
  ).toString()

  req._params = {
    ...req._params,
    url,
    urlHash: sh.unique(url)
  }

  next()
}
