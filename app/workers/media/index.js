import rpc from 'libs/message-bus'
import config from 'infrastructure/config'

import handlers from './handlers'

const { amqp } = config

Promise.all([
  rpc.createConsumer({
    name: 'worker',
    host: amqp.host
  }).connect(),
  rpc.createProducer({
    name: `worker-distributor-${Date.now()}`,
    host: amqp.host
  }).connect()
]).then(([ consumer, producer ]) => {
  console.log('worker bootstrapped')

  consumer.onMessage(async (content) => {
    const handler = handlers[content.type]

    if (!handler) {
      throw new Error(`Unsupported job: ${content.type}`)
    }

    return await handler(content.data, producer)
  })
})


