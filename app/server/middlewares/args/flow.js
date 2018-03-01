import match from 'mime-match'

import preset from './preset'
import size from './size'
import series from '../series'

export default (req, res, next) => {
  try {
    const { mime } = req._args

    if (match(mime, 'text/css')) {
      req._args.flow = [ 'download', 'cssmin' ]
      req._args.type = 'css'
    } else if (match(mime, 'application/javascript')) {
      req._args.flow = [ 'download', 'uglify' ]
      req._args.type = 'javascript'
    } else if (match(mime, 'image/jpeg') || match(mime, 'image/png')) {
      req._args.flow = [ 'download', 'optimize' ]
      req._args.type = 'image'

      return series(preset, size)(req, res, next)
    } else {
      req._args.flow = [ 'download' ]
    }
  } catch (error) {
    req._args.flow = [ 'download' ]
  }

  next()
}
