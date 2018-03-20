import express from 'express'

import createMediaEntity from '../middlewares/create-media-entity'
import fetchMediaMeta from '../middlewares/fetch-media-meta'
import processFlow from '../middlewares/process-flow'
import returnCachedMedia from '../middlewares/return-cached-media'

import flow from '../middlewares/args/flow'
import mime from '../middlewares/args/mime'
import project from '../middlewares/args/project'
import type from '../middlewares/args/type'
import storedUrl from '../middlewares/args/stored-url'
import join from '../middlewares/utils/join'

const router = express()

router.get([
  '/:slug/:sh/:p/:pv/:m\\_:w\\x:h\.:ext',
  '/:slug/:sh\.:ext'
], join(
  project,
  storedUrl,
  mime,
  type,
  flow,
  createMediaEntity,
  fetchMediaMeta,
  processFlow,
  fetchMediaMeta,
  returnCachedMedia
))

export default router
