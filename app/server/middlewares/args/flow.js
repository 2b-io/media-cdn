import preset from './preset'
import size from './size'
import series from '../series'

export default (req, res, next) => {
    const { type } = req._args

    switch (type) {
      case 'image':
        req._args.flow = [ 'crawl', 'cacheSource', 'optimize', 'cacheTarget', 'clear' ]

        return series(preset, size)(req, res, next)

      default:
        req._args.flow = [ 'crawl', 'cacheSource', 'clear' ]

        return next()
    }
}
