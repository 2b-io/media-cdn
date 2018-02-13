import preset from './middlewares/args/preset'
import project from './middlewares/args/project'
import src from './middlewares/args/src'
import width from './middlewares/args/width'

const handler = [
  project,
  preset,
  src,
  width,
  (req, res, next) => {
    res.json(req._args)
  }
]

export default app => {
  app.get(
    '/p/:slug/:hash/media',
    handler
  )

  app.get(
    '/p/:slug/media',
    handler
  )

  return app
}
