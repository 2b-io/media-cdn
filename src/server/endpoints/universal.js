import express from 'express'

import handleRequest from 'server/middlewares/handle-request'
import getContenType from 'server/middlewares/get-content-type'
import parseArgsFromQuery from 'server/middlewares/args-q'
import getPreset from 'server/middlewares/preset'
import getProject from 'server/middlewares/project'
import optimize from 'server/middlewares/optimize'
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
  getContenType,
  getPreset,
  parseArgsFromQuery,
  optimize,
  handleRequest
))

export default router
