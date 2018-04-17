import express from 'express'

import createMediaEntity from '../middlewares/create-media-entity'
import fetchMediaMeta from '../middlewares/fetch-media-meta'
import processFlow from '../middlewares/process-flow'
import returnCachedMedia from '../middlewares/return-cached-media'

import flow from '../middlewares/args/flow'
import mime from '../middlewares/args/mime'
import prettySrc from '../middlewares/args/pretty-src'
import project from '../middlewares/args/project'
import type from '../middlewares/args/type'

import join from '../middlewares/utils/join'

const router = express()

router.get('/:slug/*', join(
  // collect general args
  project,
  prettySrc,
  mime,
  type,
  flow,
   // collect general args - END

  // serve media
  createMediaEntity,
  fetchMediaMeta,
  processFlow,
  fetchMediaMeta,
  returnCachedMedia
  // serve media - END
))

export default router

