import express from 'express'

import initParamsObject from 'server/middlewares/init-params-object'
import parseArgsFromQuery from 'server/middlewares/args-q'
import createOriginOnS3 from 'server/middlewares/create-origin-on-s3'
import createTargetOnS3 from 'server/middlewares/create-target-on-s3'
import generateTargetPath from 'server/middlewares/generate-target-path'
import generateOriginPath from 'server/middlewares/generate-origin-path'
import getCacheSetting from 'server/middlewares/cache-setting'
import getPreset from 'server/middlewares/preset'
import getProject from 'server/middlewares/project'
import getPullSetting from 'server/middlewares/pull-setting'
import respondTarget from 'server/middlewares/respond-target'
import parseUrlFromQuery from 'server/middlewares/url-q'
import join from 'server/middlewares/utils/join'

const router = express()

router.get('/', join(
  initParamsObject,
  getProject,
  getPullSetting,
  getCacheSetting,
  parseUrlFromQuery,
  generateOriginPath,
  createOriginOnS3,
  getPreset,
  parseArgsFromQuery,
  generateTargetPath,
  createTargetOnS3,
  respondTarget
))

export default router
