import express from 'express'
import morgan from 'morgan'

import pretty from 'server/endpoints/pretty'
import store from 'server/endpoints/store'
import universal from 'server/endpoints/universal'

const app = express()

app.use(morgan('dev'))
app.enable('trust proxy')
app.disable('x-powered-by')

pretty.disable('x-powered-by')
store.disable('x-powered-by')
universal.disable('x-powered-by')

app.use('/p', pretty)
app.use('/s', store)
app.use('/u', universal)

app.use((req, res, next) => {
  res.sendStatus(404)
})

export default app
