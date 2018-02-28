import express from 'express'

import flow from '../middlewares/args/flow'
import mime from '../middlewares/args/mime'
import project from '../middlewares/args/project'
import prettySrc from '../middlewares/args/pretty-src'

import createMediaEntity from '../middlewares/create-media-entity'
import fetchMediaMeta from '../middlewares/fetch-media-meta'
import processFlow from '../middlewares/process-flow'
import returnMedia from '../middlewares/return-media'

const router = express()

router.get('/:slug/*', [
  // collect general args
  project,
  prettySrc,
  mime,
  flow,
   // collect general args - END

  // serve media
  createMediaEntity,
  fetchMediaMeta,
  processFlow,
  fetchMediaMeta,
  returnMedia
  // serve media - END
])

export default router

