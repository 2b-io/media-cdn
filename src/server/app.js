import express from 'express'
import morgan from 'morgan'

import api from 'server/endpoints/api'
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

app.use('/api/v1', api)
app.use('/p', pretty)
app.use('/s', store)
app.use('/u', universal)

app.use((req, res) => {
  res.sendStatus(404)
})

// app.use((error, req, res, next) => {
//   console.log(error)

//   res.sendStatus(500)
// })

export default app
