import rpc from '../src'

Promise.all([
  rpc.createConsumer().register(),
  rpc.createProducer().discover()
]).then(([ consumer, producer ]) => {
  producer.publish({
    type: 'join'
  }, (error, reply) => {
    console.log('reply', error, reply)
  })
})



// console.log('h1 started')
