import preset from './preset'
import size from './size'
import series from '../series'

export default (req, res, next) => {
    const { api, store, type } = req._args

    switch (type) {
      case 'image':
        req._args.flow = api ?
          (store ?
            [ 'mv', 'cacheSource', 'optimize', 'cacheTarget', 'clear' ] :
            [ 'mv', 'optimize' ]) :
          [ 'crawl', 'cacheSource', 'optimize', 'cacheTarget', 'clear' ]

        return series(preset, size)(req, res, next)

      default:
        req._args.flow = api ?
          (store ?
            [ 'mv', 'cacheSource', 'clear' ] :
            [ 'mv' ]) :
          [ 'crawl', 'cacheSource', 'clear' ]

        return next()
    }
}
