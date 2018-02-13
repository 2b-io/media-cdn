import rpc from 'one-doing-the-rest-waiting'

import config from 'infrastructure/config'

const consumer = rpc.createConsumer({
  prefix: config.queuePrefix,
  redis: config.redis
})

consumer.register(input => {
  console.log('worker [media] done')
})
