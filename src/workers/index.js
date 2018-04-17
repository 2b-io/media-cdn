import rpc from 'libs/message-bus'
import config from 'infrastructure/config'

const { amq: { host, prefix } } = config

const crawl = async (producer) => {
  return new Promise((resolve, reject) => {
    producer.request()
      .content({ job: 'crawl' })
      .sendTo('worker')
      .ttl(10e3)
      .onReply(async (error, content) => {
        console.log('crawl... done')

        resolve()
      })
      .send()
  })
}

const optimize = async (producer) => {
  return new Promise((resolve, reject) => {
    producer.request()
      .content({ job: 'optimize' })
      .sendTo('worker')
      .ttl(10e3)
      .onReply(async (error, content) => {
        console.log('optimize... done')

        resolve()
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
    const { job } = content

    switch (job) {
      case 'process':
        await crawl(producer)

        await optimize(producer)

        return { succeed: true }

      case 'crawl':
        console.log('crawl...')

        return { succeed: true }

      case 'optimize':
        console.log('optimize...')

        return { succeed: true }
    }

    return { succeed: false }
  })

  console.log('worker bootstrapped')
}

main()
