import querystring from 'querystring'
import { URL } from 'url'

export default (req, res, next) => {
  const { project } = req._args

  req._args = {
    ...req._args,
    src: new URL(
      req.params[0] + (
        Object.keys(req.query).length ?
          '?' + querystring.stringify(req.query) : ''
      ),
      project.prettyOrigin
    ),
    crawlable: true
  }

  next()
}
