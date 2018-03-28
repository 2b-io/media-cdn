import delay from 'delay'
import rpc from '../src'

rpc.createConsumer().connect()
.then(consumer => {
  consumer.onMessage(async (msg) => {
    // await delay(1e3)
    console.log('hahaha', msg.value)

    return { value: msg.value }
  })
})
