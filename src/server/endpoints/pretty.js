import express from 'express'

import parseArgsFromQuery from 'server/middlewares/args-q'
import createOriginOnS3 from 'server/middlewares/create-origin-on-s3'
import createTargetOnS3 from 'server/middlewares/create-target-on-s3'
import generateTargetPath from 'server/middlewares/generate-target-path'
import generateOriginPath from 'server/middlewares/generate-origin-path'
import getPreset from 'server/middlewares/preset'
import getProject from 'server/middlewares/project'
import getPullSetting from 'server/middlewares/pull-setting'
import respondTarget from 'server/middlewares/respond-target'
import parseUrlFromPath from 'server/middlewares/url-p'
import join from 'server/middlewares/utils/join'

const router = express()

router.get('/:identifier/*', join(
  (req, res, next) => {
    if (!req.params[0]) {
      return next({
        statusCode: 400,
        reason: 'URL is missing'
      })
    }

    next()
  },
  (req, res, next) => {
    req._params = {
      identifier: req.params.identifier
    }

    next()
  },
  getProject,
  getPullSetting,
  parseUrlFromPath,
  generateOriginPath,
  createOriginOnS3,
  getPreset,
  parseArgsFromQuery,
  generateTargetPath,
  createTargetOnS3,
  respondTarget
))

export default router
