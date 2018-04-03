import delay from 'delay'
import rpc from '../src'

Promise.all([
  rpc.createConsumer().connect(),
  rpc.createConsumer().connect(),
  // null,
  rpc.createProducer({ name: 'xxx' }).connect(),
  rpc.createProducer({ name: 'yyy' }).connect()
]).then(async ([ consumer1, consumer2, producer1, producer2 ]) => {
  consumer1.onMessage(async (content) => {
    await delay(500)

    console.log('hihihi', content.value)

    return { value: content.value }
  })

  consumer2.onMessage(async (content) => {
    await delay(500)

    console.log('hihiha', content.value)

    return { value: content.value }
  })

  for (var i = 0; i < 2; i++) {
    producer1.request()
      .content({ value: i })
      .ttl(2e3)
      // .waitFor('abc')
      .onReply(async (error, content) => {
        if (error) {
          return producer1.log(error.toString())
        }

        producer1.log('producer1', content)
      })
      .send()

    producer2.request()
      .content({ value: i + 10 })
      .ttl(2e3)
      // .waitFor('abc')
      .onReply(async (error, content) => {
        if (error) {
          return producer2.log(error.toString())
        }

        producer2.log('producer2', content)
      })
      .send()
  }

})

