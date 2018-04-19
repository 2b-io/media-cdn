import deserializeError from 'deserialize-error'
import fs from 'fs-extra'
import rpc from 'libs/message-bus'
import config from 'infrastructure/config'
import cache from 'services/cache'
import crawler from 'services/crawler'
import optimizer from 'services/optimizer'

const { amq: { host, prefix } } = config

const crawl = async (producer, payload) => {
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

const optimize = async (producer, payload) => {
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

const main = async () => {
  const [ consumer, producer ] = await Promise.all([
    rpc.createConsumer({
      name: 'worker',
      host,
      prefix
    }).connect(),
    rpc.createProducer({
      name: `worker-distributor-${Date.now()}`,
      host,
      prefix
    }).connect()
  ])

  consumer.onMessage(async (content) => {
    const { job, payload } = content

    switch (job) {
      case 'process':
        console.log('process...')

        await crawl(producer, payload)

        await optimize(producer, payload)

        console.log('process... done')

        return

      case 'crawl':
        console.log('crawl...')

        const meta = await cache.head(payload.origin)

        if (!meta) {
          let file

          try {
            file = await crawler.crawl(payload.url)

            await cache.put(payload.origin, file)
          } finally {
            if (file) {
              await fs.remove(file.path)
            }
          }
        }

        console.log('crawl... done')

        return

      case 'optimize':
        console.log('optimize...')

        let origin, target

        try {
          const origin = await cache.get(payload.origin)

          const target = await optimizer.optimize(origin, payload.args)

          await cache.put(payload.target, target)

        } finally {
          if (origin) {
            await fs.remove(origin.path)
          }

          if (target) {
            await fs.remove(target.path)
          }
        }

        console.log('optimize... done')

        return
    }

    return { succeed: false }
  })

  console.log('worker bootstrapped')
}

main()
