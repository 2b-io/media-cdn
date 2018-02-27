import express from 'express'
import urlJoin from 'url-join'

import force from '../middlewares/args/force'
import preset from '../middlewares/args/preset'
import project from '../middlewares/args/project'
import size from '../middlewares/args/size'

import serveMedia from '../middlewares/serve-media'

const router = express()

router.get([
  '/p/:slug/*'
], [
  project,
  preset,
  (req, res, next) => {
    const src = req.params[0]
    const { project } = req._args

    req._args = {
      ...req._args,
      src: urlJoin(project.prettyOrigin, src)
    }

    next()
  },
  size,
  force,
  (req, res, next) => {
    const { preset, project, src } = req._args

    if (!preset || !project || !src) {
      return res.sendStatus(400)
    }

    next()
  },
  serveMedia
])

export default router
