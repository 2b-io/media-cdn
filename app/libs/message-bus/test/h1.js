import rpc from '../src'

Promise.all([
  rpc.createConsumer().register(),
  rpc.createProducer().discover()
]).then(([ consumer, producer ]) => {
  console.log('done')
  console.log(`Consumer: ${consumer._id}`)
  console.log(`Producer: ${producer._id}`)
})



// console.log('h1 started')
