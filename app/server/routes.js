import preset from './middlewares/preset'
import project from './middlewares/project'
import src from './middlewares/src'
import width from './middlewares/width'

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
