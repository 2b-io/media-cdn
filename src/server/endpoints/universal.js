import express from 'express'

import parseArgsFromQuery from 'server/middlewares/args-q'
import createOriginOnS3 from 'server/middlewares/create-origin-on-s3'
import createTargetOnS3 from 'server/middlewares/create-target-on-s3'
import generateTargetPath from 'server/middlewares/generate-target-path'
import generateOriginPath from 'server/middlewares/generate-origin-path'
import getPreset from 'server/middlewares/preset'
import getProject from 'server/middlewares/project'
import respondTarget from 'server/middlewares/respond-target'
import parseUrlFromQuery from 'server/middlewares/url-q'
import join from 'server/middlewares/utils/join'

const router = express()

router.get([ '/:identifier', '/:identifier/media' ], join(
  async (req, res, next) => {
    req._params = {
      identifier: req.params.identifier
    }

    next()
  },
  getProject,
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
