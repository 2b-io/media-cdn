import express from 'express'
import rpc from 'one-doing-the-rest-waiting'

import config from 'infrastructure/config'
import initRoutes from './routes'

const { queuePrefix:prefix, redis, serverPort } = config

rpc
  .createProducer({ prefix, redis })
  .discover(channel => {
    const app = initRoutes(express())

    app.enable('trust proxy')
    app.disable('x-powered-by')
    app.set('rpc', channel)

    app.listen(serverPort, () => console.log(`Server start at :${serverPort}`))
  })
