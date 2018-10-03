import mime from 'mime'
import sh from 'shorthash'
import cache from 'services/cache'
import staticPath from 'services/static-path'

export default [

async function createParamsOptimal (req, res, next) {

    const {
      args: {
        mode = 'cover',
        width = 'auto',
        height = 'auto'
      },
      project: { identifier },
      preset: { contentType, parameters },
      urlHash,
      ext
    } = req._params

    const presetHash = sh.unique(
      JSON.stringify(
        parameters,
        Object.keys(parameters).sort()
      )
    )

    req._params.origin = `${ identifier }/${ urlHash }`


    // get file goc + tim preset the content-type

    // req._params.target = `${ identifier }/${ urlHash }/${ contentType }/${ valueHash }/${ mode }_${ width }x${ height }`


    req._params.target = `${ identifier }/${ urlHash }/${ presetHash }/${ mode }_${ width }x${ height }.${ ext }`

    next()
  },
  (req, res, next) => {
    const meta = req._meta

    console.log(`PIPE ${ req._params.target }`)

    const { target } = req._params
    const { ext } = req._params || 'mdn'
    const params = { ...req._params, ext }

    res.set('accept-ranges', meta.AcceptRanges)
    res.set('content-type', meta.ContentType)
    res.set('content-length', meta.ContentLength)
    res.set('last-Modified', meta.LastModified)
    res.set('etag', meta.ETag)
    res.set('cache-control', meta.CacheControl)

    res.set('x-origin-path', staticPath.origin(params))

    res.set('x-target-path', staticPath.target(params))
    console.log('target', target);
    cache.stream(target)
      .on('error', (error) => {
        return next({
          statusCode: 500,
          reason: error
        })
      })
      .pipe(res)
  }
]
