import delay from 'delay'
import rpc from '../src'

Promise.all([
  rpc.createConsumer().connect(),
  rpc.createConsumer().connect(),
  // null,
  rpc.createProducer().connect()
]).then(async ([ consumer1, consumer2, producer ]) => {
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
    producer.request()
      .content({ value: i })
      .ttl(2e3)
      .waitFor('abc')
      // .onReply(async (error, content) => {
      //   if (error) {
      //     return producer.log(error.toString())
      //   }

      //   producer.log('onReply', content)
      // })
      .send()
  }

})

