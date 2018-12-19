import express from 'express'
import morgan from 'morgan'
import serializeError from 'serialize-error'

import config from 'infrastructure/config'

import pretty from 'server/endpoints/pretty'
import universal from 'server/endpoints/universal'

const app = express()

app.get([
  '/favicon.ico',
  '/robots.txt'
], (req, res) => res.sendStatus(404))

app.use(morgan('dev'))
app.enable('trust proxy')
app.disable('x-powered-by')

pretty.disable('x-powered-by')
universal.disable('x-powered-by')

app.use('/u', universal)
app.use('/', pretty)

app.use((req, res) => {
  res.sendStatus(404)
})

app.use((error, req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  res.set('Surrogate-Control', 'no-store')

  if (!config.development) {
    console.error(error)

    return res.sendStatus(error.statusCode || 500)
  }

  res.status(error.statusCode || 500).json({
    ...error,
    reason: serializeError(error.reason)
  })
})

export default app
