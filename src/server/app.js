import express from 'express'
import morgan from 'morgan'

const app = express()

app.use(morgan('dev'))
app.enable('trust proxy')
app.disable('x-powered-by')

export default app

app.get('/', [
  (req, res, next) => {
    console.log('assert parameters')
    next()
  },
  (req, res, next) => {
    console.log('HEAD /the-resource')
    next()
  },
  (req, res, next) => {
    console.log('JOB /process')

    const producer = app.get('rpc')

    producer.request()
      .content({
        job: 'process'
      })
      .sendTo('worker')
      .ttl(10e3)
      .onReply(async (error, content) => {
        console.log(error, content)

        next()
      })
      .send()
  },
  (req, res, next) => {
    console.log('GET /the-resource')

    res.send('ok')
  }
])
