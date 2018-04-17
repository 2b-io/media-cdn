import express from 'express'
import morgan from 'morgan'

import api from './routes/api'
import pretty from './routes/pretty'
import store from './routes/store'
import tool from './routes/tool'
import universal from './routes/universal'

const app = express()

app.use(morgan('dev'))
app.enable('trust proxy')
app.disable('x-powered-by')

app.use('/a', api)
app.use('/p', pretty)
app.use('/u', universal)
app.use('/s', store)
app.use('/t', tool)

app.use((error, req, res, next) => {
  console.log(error)

  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  res.set('Surrogate-Control', 'no-store')
  res.sendStatus(400)
})

export default app
