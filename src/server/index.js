import rpc from 'libs/message-bus'
import config from 'infrastructure/config'

import app from './app'

const { amq: { host, prefix }, server: { port, bind } } = config

const main = async () => {
  const producer = await rpc.createProducer({
    name: `web-server-${ Date.now() }`,
    host,
    prefix
  }).connect()

  app.set('rpc', producer)

  app.listen(port, bind, () => {
    console.log(`Server start at ${ bind }:${ port }`)
  })
}

main()
