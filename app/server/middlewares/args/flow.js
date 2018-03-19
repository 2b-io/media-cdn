import preset from './preset'
import size from './size'
import series from '../series'

export default (req, res, next) => {
    const { api, type } = req._args

    switch (type) {
      case 'image':
        req._args.flow = api ?
          [ 'mv', 'optimize' ] :
          [ 'crawl', 'cacheSource', 'optimize', 'cacheTarget', 'clear' ]

        return series(preset, size)(req, res, next)

      default:
        req._args.flow = api ?
          [ 'mv' ] :
          [ 'crawl', 'cacheSource', 'clear' ]

        return next()
    }
}
