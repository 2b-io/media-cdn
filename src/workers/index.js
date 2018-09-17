import rpc from 'libs/message-bus'
import config from 'infrastructure/config'

import crawl from './jobs/crawl'
import head from './jobs/head'
import process from './jobs/process'
import optimize from './jobs/optimize'

const { amq: { host, prefix } } = config

const main = async () => {
  const [ consumer, producer ] = await Promise.all([
    rpc.createConsumer({
      name: 'worker',
      host,
      prefix
    }).connect(),
    rpc.createProducer({
      name: `worker-distributor-${ Date.now() }`,
      host,
      prefix
    }).connect()
  ])

  consumer.onMessage(async (content) => {
    const { job, payload } = content

    switch (job) {
      case 'process':
        return await process(payload, producer)

      case 'crawl':
        return await crawl(payload)

      case 'optimize':
        return await optimize(payload)

      case 'head':
        return await head(payload)
    }

    return { succeed: false }
  })

  console.log('worker bootstrapped')
}

main()
