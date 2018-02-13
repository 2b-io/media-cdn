import rpc from 'one-doing-the-rest-waiting'

import config from 'infrastructure/config'
import Media from 'entities/Media'

const { queuePrefix, redis } = config

Promise.all([
  new Promise(resolve => {
    rpc.createConsumer({
      prefix: queuePrefix,
      redis: redis
    }).register(resolve)
  }),
  new Promise(resolve => {
    rpc.createProducer({
      prefix: queuePrefix,
      redis: redis
    }).discover(resolve)
  })
]).then(([ input, output ]) => {
  console.log('worker [media] done')

  input.onRequest((message, done) => {
    const media = Media.from(message.data.media)

    switch (message.type) {
      case 'process-media':
        return done({
          succeed: true,
          media: media
        })
    }

    done({
      succeed: false
    })
  })
})
