import series from 'async/series'
import dl from 'download'
import fs from 'fs'
// import rpc from 'one-doing-the-rest-waiting'
import serializeError from 'serialize-error'

import rpc from 'libs/message-bus'
import config from 'infrastructure/config'

import handlers from './handlers'

const { queuePrefix:prefix, redis } = config

Promise.all([
  rpc.createConsumer().connect(),
  rpc.createProducer().connect()
  // new Promise(resolve => {
  //   rpc.createConsumer({ prefix, redis }).register(resolve)
  // }),
  // new Promise(resolve => {
  //   rpc.createProducer({ prefix, redis }).discover(resolve)
  // })
]).then(([ input, output ]) => {
  console.log('worker bootstrapped')

  input.onMessage(async (content) => {
    try {

      const handler = handlers[content.type]

      if (!handler) {
        throw new Error(`Unsupported job: ${content.type}`)
      }

      handler(content.data, output, done)
    } catch (error) {
      done({
        succeed: false,
        reason: serializeError(error)
      })
    }
  })
})


