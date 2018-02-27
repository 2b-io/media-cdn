import morgan from 'morgan'

import pretty from './routes/pretty'
import universal from './routes/universal'

export default app => {
  // devlopment log
  app.use(morgan('dev'))

  // register hook
  app.use((req, res, next) => {
    // req.on('end', () => console.log('end', res.statusCode))

    next()
  })

  // supported endpoints
  // universal
  app.use(universal)

  // pretty
  app.use(pretty)

  // // pretty
  // app.get([
  //   '/p/:slug/:hash/*',
  //   '/p/:slug/*'
  // ], (req, res, next) => {
  //   res.json(req.params)
  // })

  // otherwise
  app.use((error, req, res, next) => {
    res.sendStatus(400)
  })

  return app
}
