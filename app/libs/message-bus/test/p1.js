import rpc from '../src'

rpc.createProducer().connect()
  .then(producer => {
    for (var i = 0; i < 2; i++) {
      producer.request()
        .content({ value: i })
        .ttl(1e3)
        .waitFor('abc')
        .onReply((error, content) => {
          if (error) {
            return producer.log(error.toString())
          }

          producer.log('onReply', content)
        })
        .send()
    }
  })
