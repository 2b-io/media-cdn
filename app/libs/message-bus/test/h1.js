import delay from 'delay'
import rpc from '../src'

Promise.all([
  rpc.createConsumer().connect(),
  // null,
  rpc.createProducer().connect()
]).then(async ([ consumer, producer ]) => {
  consumer.onMessage(async (msg) => {
    await delay(500)

    console.log('hihihi', msg.value)

    return { value: msg.value }
  })

  for (var i = 0; i < 2000; i++) {

  producer.publish({
    value: i
  }, (error, msg) => {
    if (error) {
      return
    }

    const content = producer.parseContent(msg)

    producer.log('reply', error, content)

    console.log('reply', content.value)
  })
}

})

