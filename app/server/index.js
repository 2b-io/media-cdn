import rpc from 'one-doing-the-rest-waiting'

import config from 'infrastructure/config'
import app from './app'

const { queuePrefix:prefix, redis, serverPort } = config

rpc
  .createProducer({ prefix, redis })
  .discover(channel => {
    app.set('rpc', channel)

    app.listen(serverPort, () => console.log(`Server start at :${serverPort}`))
  })
