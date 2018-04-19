import deserializeError from 'deserialize-error'

const crawl = async (payload, producer) => {
  return await new Promise((resolve, reject) => {
    producer.request()
      .content({
        job: 'crawl',
        payload: {
          url: payload.url,
          origin: payload.origin
        }
      })
      .waitFor(`crawl:${payload.origin}`)
      .sendTo('worker')
      .ttl(30e3)
      .onReply(async (error) => {
        if (error) {
          reject(deserializeError(error))
        } else {
          resolve()
        }
      })
      .send()
  })
}

const optimize = async (payload, producer) => {
  return new Promise((resolve, reject) => {
    producer.request()
      .content({
        job: 'optimize',
        payload: {
          origin: payload.origin,
          target: payload.target,
          args: payload.args
        }
      })
      .waitFor(`optimize:${payload.origin}`)
      .sendTo('worker')
      .ttl(30e3)
      .onReply(async (error) => {
        if (error) {
          reject(deserializeError(error))
        } else {
          resolve()
        }
      })
      .send()
  })
}

export default async (payload, producer) => {
  console.log('process...')
  console.time('process...')

  await crawl(payload, producer)

  await optimize(payload, producer)

  console.timeEnd('process...')
}
