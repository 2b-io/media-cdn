import express from 'express'

import handleRequest from 'server/middlewares/handle-request'
import parseArgsFromQuery from 'server/middlewares/args-q'
import parseUrlFromQuery from 'server/middlewares/url-q'
import join from 'server/middlewares/utils/join'

import da from 'services/da'

const router = express()

router.get([ '/:slug', '/:slug/media' ], join(
  async (req, res, next) => {
    req._params = {}

    next()
  },
  parseUrlFromQuery,
  async (req, res, next) => {
    const { slug } = req.params

    const project = req._params.project = await da.getProject(slug)

    if (!project) {
      return res.sendStatus(400)
    }

    next()
  },
  async (req, res, next) => {
    const hash = req.query.p || 'default'
    const { project: { _id } } = req._params

    const preset = req._params.preset = await da.getPreset(hash, _id)

    if (!preset) {
      return res.sendStatus(400)
    }

    next()
  },
  parseArgsFromQuery,
  handleRequest
))

export default router
