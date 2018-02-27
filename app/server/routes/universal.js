import express from 'express'

import force from '../middlewares/args/force'
import preset from '../middlewares/args/preset'
import project from '../middlewares/args/project'
import size from '../middlewares/args/size'
import src from '../middlewares/args/src'

import serveMedia from '../middlewares/serve-media'

const router = express()

router.get([
  '/u/:slug/:hash/media',
  '/u/:slug/media'
], [
  project,
  preset,
  src,
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
