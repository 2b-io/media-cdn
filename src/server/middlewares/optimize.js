
export default async function optimize(req, res, next) {


  console.log(`OPTIMIZE ${ req._params.origin }`)

  const producer = req.app.get('rpc')

  producer.request()
    .content({
      job: 'optimize',
      payload: {
        origin: req._params.origin,
        target: req._params.target,
        args: req._params.args,
        meta:req._meta
      }
    })
    .waitFor(`optimize:${ req._params.target }`)
    .sendTo('worker')
    .ttl(30e3)
    .onReply(async (error, content) => {
      if (error) {
        return next({
          statusCode: 500,
          reason: error
        })
      }

      req._meta = content.meta
      console.log('req._meta', req._meta);

      next()
    })
    .send()
}
