import deserializeError from 'deserialize-error'

export default async function getTargetMeta(req, res, next) {

  const meta = await new Promise((resolve, reject) => {
    const s = Date.now()
    console.log(`HEAD ${ req._params.target }...`)
    const producer = req.app.get('rpc')
    producer.request()
      .content({
        job: 'head',
        payload: {
          target: req._params.target,
        }
      })
      .waitFor(`head:${ req._params.target }`)
      .sendTo('worker')
      .ttl(30e3)
      .onReply(async (error, content) => {
        console.log(`HEAD ${ req._params.target }... ${ Date.now() -s }ms`)

        if (error) {
          reject(deserializeError(error))
        } else {
          resolve(content)
        }
      })
      .send()
  })
  req._meta = meta

  next()
}
