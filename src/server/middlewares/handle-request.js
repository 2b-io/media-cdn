import mime from 'mime'
import sh from 'shorthash'
import cache from 'services/cache'
import staticPath from 'services/static-path'

export default [
  (req, res, next) => {
    if (req._params.origin || req._params.target) {
      return next()
    }

    const {
      args: {
        mode = 'cover',
        width = 'auto',
        height = 'auto'
      },
      project: { slug },
      preset: { hash, values },
      urlHash
    } = req._params

    const valueHash = sh.unique(
      JSON.stringify(
        values,
        Object.keys(values).sort()
      )
    )

    req._params.origin = `${ slug }/${ urlHash }`

    req._params.target = `${ slug }/${ urlHash }/${ hash }/${ valueHash }/${ mode }_${ width }x${ height }`

    next()
  },
  async (req, res, next) => {
    if (req.query.f) {
      return next()
    }

    console.log(`HEAD ${ req._params.target }`)

    req._meta = await cache.head(req._params.target)

    next()
  },
  (req, res, next) => {
    if (req._meta) {
      return next()
    }

    console.log(`PROCESS ${ req._params.target }`)

    const producer = req.app.get('rpc')

    producer.request()
      .content({
        job: 'process',
        payload: {
          url: req._params.url,
          origin: req._params.origin,
          target: req._params.target,
          args: {
            ...req._params.preset.values,
            ...req._params.args
          }
        }
      })
      .waitFor(`process:${ req._params.target }`)
      .sendTo('worker')
      .ttl(60e3)
      .onReply(async (error) => {
        if (error) {
          return res.status(500).send(error)
        }

        next()
      })
      .send()
  },
  async (req, res, next) => {
    if (req._meta) {
      return next()
    }

    console.log(`PROCESS ${ req._params.target }`)

    req._meta = await cache.head(req._params.target)

    next()
  },
  (req, res) => {
    const meta = req._meta

    if (!meta) {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      res.set('Pragma', 'no-cache')
      res.set('Expires', '0')
      res.set('Surrogate-Control', 'no-store')
      return res.sendStatus(500)
    }

    console.log(`PIPE ${ req._params.target }`)

    const { target } = req._params
    const ext = mime.getExtension(meta.ContentType)
    const params = { ...req._params, ext }

    res.set('accept-ranges', meta.AcceptRanges)
    res.set('content-type', meta.ContentType)
    res.set('content-length', meta.ContentLength)
    res.set('last-Modified', meta.LastModified)
    res.set('etag', meta.ETag)
    res.set('cache-control', meta.CacheControl)

    res.set('x-origin-path', staticPath.origin(params))
    res.set('x-target-path', staticPath.target(params))

    cache.stream(target).pipe(res)
  }
]
