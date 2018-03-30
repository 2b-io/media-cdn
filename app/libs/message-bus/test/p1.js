import rpc from '../src'

rpc.createProducer().connect()
  .then(producer => {
    for (var i = 0; i < 20; i++) {
      producer.request()
        .content({ value: i })
        .waitFor('abc')
        .onReply(response => {
          producer.log('onReply', response.content.toString())
        })
        .ttl(10e3)
        .send()
    }
  })
