import express from 'express'

import flow from '../middlewares/args/flow'
import mime from '../middlewares/args/mime'
import project from '../middlewares/args/project'
import type from '../middlewares/args/type'
import universalSrc from '../middlewares/args/universal-src'

import createMediaEntity from '../middlewares/create-media-entity'
import fetchMediaMeta from '../middlewares/fetch-media-meta'
import processFlow from '../middlewares/process-flow'
import returnMedia from '../middlewares/return-media'

const router = express()

router.get([ '/:slug', '/:slug/media' ], [
  // collect general args
  project,
  universalSrc,
  mime,
  type,
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

