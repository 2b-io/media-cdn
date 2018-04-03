import delay from 'delay'
import rpc from '../src'

rpc.createConsumer().connect()
.then(consumer => {
  consumer.onMessage(async (content) => {
    await delay(1e3)
    console.log('hahaha', content.value)

    return { value: content.value }
  })
})
