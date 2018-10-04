import mime from 'mime'

import cache from 'services/cache'

export default [
  async function checkExistTarget(req, res, next) {

    if (req.query.f) {
      return next()
    }

    console.log(`HEAD ${ req._params.target }`)
    try {
      req._targetMeta = await cache.head(req._params.target)
    } catch (error) {
      console.log(`NOTFOUND ${ req._params.target }`)
    }

    next()
  },
  async function optimizeTarget(req, res, next) {

    if (req._targetMeta) {
      return next()
    }

    const producer = req.app.get('rpc')

     await new Promise((resolve, reject) => {
      const s = Date.now()
      console.log(`OPTIMIZE ${ req._params.origin } -> ${ req._params.target }...`)
      producer.request()
        .content({
          job: 'optimize',
          payload: {
            origin: req._params.origin,
            target: req._params.target,
            args: req._params.args
          }
        })
        .waitFor(`optimize:${ req._params.target }`)
        .sendTo('worker')
        .ttl(30e3)
        .onReply(async (error, content) => {
          console.log(`OPTIMIZE ${ req._params.origin } -> ${ req._params.target }... ${ Date.now() - s }ms`)

          if (error) {
            reject(deserializeError(error))
          } else {
            resolve(content)
          }

        })
        .send()
    })
    
    next()
  }
]
