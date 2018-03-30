import rpc from '../src'

rpc.createProducer().connect()
  .then(producer => {
    for (var i = 0; i < 20; i++) {
      producer.request()
        .content({ value: i })
        .ttl(10e3)
        // .waitFor('abc')
        .onReply((error, content) => {
          if (error) {
            return producer.log(error.toString())
          }

          producer.log('onReply', content)
        })
        .send()
    }
  })
