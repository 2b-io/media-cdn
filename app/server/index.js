import express from 'express'
import rpc from 'one-doing-the-rest-waiting'

import config from 'infrastructure/config'
import initRoutes from './routes'

const app = initRoutes(express())
const { queuePrefix, redis, serverPort } = config

const producer = rpc.createProducer({
  prefix: queuePrefix,
  redis: redis
})

producer.discover(channel => {
  app.set('rpc', channel)

  app.listen(serverPort, () => console.log(`Server start ap :${serverPort}`))
})
