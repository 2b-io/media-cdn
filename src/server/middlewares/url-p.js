import querystring from 'querystring'
import sh from 'shorthash'
import { URL } from 'url'

export default async (req, res, next) => {
  const { pullSetting } = req._params
  const url = new URL(
    req.params[0] + (
      Object.keys(req.query).length ?
        '?' + querystring.stringify(req.query) : ''
    ),
    pullSetting.pullURL
  ).toString()
  req._params = {
    ...req._params,
    url,
    urlHash: sh.unique(url)
  }

  next()
}
