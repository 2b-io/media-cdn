import rpc from '../src'

rpc.createProducer().connect()
  .then(producer => {
    for (var i = 0; i < 20; i++) {
      producer.request()
        .content({ value: i })
        .waitFor('abc')
        .onReply((error, response) => {
          if (error) {
            return producer.log(error.toString())
          }

          producer.log('onReply', response.content.toString())
        })
        .ttl(500)
        .send()
    }
  })
