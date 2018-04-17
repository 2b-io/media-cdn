import express from 'express'

import createMediaEntity from '../middlewares/create-media-entity'
import handleUpload from '../middlewares/handle-upload'
import processFlow from '../middlewares/process-flow'
import returnLocalMedia from '../middlewares/return-local-media'
import api from '../middlewares/args/api'
import flow from '../middlewares/args/flow'
import project from '../middlewares/args/project'
import type from '../middlewares/args/type'
import join from '../middlewares/utils/join'

const router = express()

/*
  Form Data:
  + store:
    + true -> return JSON
    + false -> return blob
  + media: blob
  + w/width: done
  + h/height: done
  + m/mode: done
  + p/preset: done
*/
router.post('/:slug/media', join(
  project,
  handleUpload,
  api,
  type,
  flow,
  createMediaEntity,
  processFlow,
  returnLocalMedia
))

export default router
