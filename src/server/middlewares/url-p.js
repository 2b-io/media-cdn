import querystring from 'querystring'
import sh from 'shorthash'
import { URL } from 'url'

export default function parseUrlFromPath(req, res, next) {
  const { pullSetting } = req._params
  console.log('pullSetting', pullSetting);
  console.log('pullSetting.pullUrl', pullSetting.pullUrl);
  const url = new URL(
    req.params[0] + (
      Object.keys(req.query).length ?
        '?' + querystring.stringify(req.query) : ''
    ),
    pullSetting.pullUrl
  ).toString()
  req._params = {
    ...req._params,
    url,
    hashedURL: sh.unique(url)
  }

  next()
}
