import 'newrelic'
import rpc from 'one-doing-the-rest-waiting'

import config from 'infrastructure/config'
import app from './app'

const { queuePrefix:prefix, redis, server, development } = config

rpc
  .createProducer({ prefix, redis })
  .discover(channel => {
    app.set('rpc', channel)

    app.listen(server.port, () => console.log(`Server start at :${server.port}`))
  })
