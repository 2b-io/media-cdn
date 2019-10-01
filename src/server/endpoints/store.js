import express from 'express'
import mime from 'mime'
import sh from 'shorthash'

import initParamsObject from 'server/middlewares/init-params-object'
import createTargetHashOnS3 from 'server/middlewares/create-target-hash-on-s3'
import staticPath from 'services/static-path'
import join from 'server/middlewares/utils/join'
import getProject from 'server/middlewares/project'
import getPullSetting from 'server/middlewares/pull-setting'
import getPreset from 'server/middlewares/preset'
import parseUrlInputParams from 'server/middlewares/url-input-params'

const router = express()

router.get('/:id', join(
  initParamsObject,
  getProject,
  getPullSetting,
  getPreset,
  parseUrlInputParams,
  createTargetHashOnS3
))

export default router
