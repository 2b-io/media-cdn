import 'newrelic'
import rpc from 'libs/message-bus'

import config from 'infrastructure/config'
import app from './app'

const { amq, server } = config

rpc
  .createProducer({
    name: `web-server-${Date.now()}`,
    host: amq.host,
    prefix: amq.prefix
  })
  .connect()
  .then(producer => {
    app.set('rpc', producer)

    app.listen(server.port, () => console.log(`Server start at :${server.port}`))
  })
