import series from 'async/series'
import dl from 'download'
import fs from 'fs'
import rpc from 'one-doing-the-rest-waiting'
import serializeError from 'serialize-error'

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
    try {

      const handler = handlers[message.type]

      if (!handler) {
        throw new Error(`Unsupported job: ${message.type}`)
      }

      handler(message.data, output, done)
    } catch (error) {
      done({
        succeed: false,
        reason: serializeError(error)
      })
    }
  })
})


