import series from 'async/series'
import dl from 'download'
import fs from 'fs'
import rpc from 'one-doing-the-rest-waiting'

import config from 'infrastructure/config'

import handlers from './handlers'

const { queuePrefix:prefix, redis } = config

Promise.all([
  new Promise(resolve => {
    rpc.createConsumer({ prefix, redis }).register(resolve)
  }),
  new Promise(resolve => {
    rpc.createProducer({ prefix, redis }).discover(resolve)
  })
]).then(([ input, output ]) => {
  console.log('worker bootstrapped')

  input.onRequest((message, done) => {
    const handler = handlers[message.type]

    if (!handler) {
      return done({
        succeed: false
      })
    }

    handler(message.data, output, done)
  })
})


