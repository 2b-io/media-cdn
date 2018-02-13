import preset from './middlewares/args/preset'
import project from './middlewares/args/project'
import src from './middlewares/args/src'
import width from './middlewares/args/width'

import Media from 'entities/Media'

const handler = [
  project,
  preset,
  src,
  width,
  (req, res, next) => {
    const { preset, project, src, width } = req._args

    if (!preset || !project || !src || !width) {
      return res.sendStatus(400)
    }

    next()
  },
  (req, res, next) => {
    const { preset, project, src, width } = req._args

    res.json(Media.create({
      preset,
      project,
      src,
      width
    }))
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

  app.use((error, req, res, next) => res.sendStatus(500))

  return app
}
