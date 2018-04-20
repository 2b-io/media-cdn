import sh from 'shorthash'
import cache from 'services/cache'

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

    req._params.origin = `${slug}/${urlHash}`

    req._params.target = `${slug}/${urlHash}/${hash}/${valueHash}/${mode}_${width}x${height}`

    next()
  },
  async (req, res, next) => {
    if (req.query.f) {
      return next()
    }

    console.log(`HEAD ${req._params.target}`)

    req._meta = await cache.head(req._params.target)

    next()
  },
  (req, res, next) => {
    if (req._meta) {
      return next()
    }

    console.log(`PROCESS ${req._params.target}`)

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
      .waitFor(`process:${req._params.target}`)
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

    console.log(`PROCESS ${req._params.target}`)

    req._meta = await cache.head(req._params.target)

    next()
  },
  (req, res, next) => {
    if (!req._meta) {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      res.set('Pragma', 'no-cache')
      res.set('Expires', '0')
      res.set('Surrogate-Control', 'no-store')
      return res.status(500).json(req._params)
    }

    console.log(`PIPE ${req._params.target}`)

    res.set('accept-ranges', req._meta.AcceptRanges)
    res.set('content-type', req._meta.ContentType)
    res.set('content-length', req._meta.ContentLength)
    res.set('last-Modified', req._meta.LastModified)
    res.set('etag', req._meta.ETag)
    res.set('cache-control', req._meta.CacheControl)
    cache.stream(req._params.target).pipe(res)
  }
]
