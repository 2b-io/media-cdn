// import 'newrelic'
// import rpc from 'one-doing-the-rest-waiting'
import rpc from 'libs/message-bus'

import config from 'infrastructure/config'
import app from './app'

const { queuePrefix:prefix, redis, server, development } = config

rpc
  .createProducer()
  .connect()
  .then(producer => {
    app.set('rpc', producer)

    app.listen(server.port, () => console.log(`Server start at :${server.port}`))
  })
