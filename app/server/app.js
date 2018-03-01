import express from 'express'
import morgan from 'morgan'

import pretty from './routes/pretty'
import universal from './routes/universal'

const app = express()

app.use(morgan('dev'))
app.enable('trust proxy')
app.disable('x-powered-by')

app.use('/u', universal)
app.use('/p', pretty)

app.use((error, req, res, next) => {
  console.log(error)

  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  res.set('Surrogate-Control', 'no-store')
  res.status(400).send(error)
})

export default app
