import express from 'express'

import handleRequest from 'server/middlewares/handle-request'
import parseArgsFromQuery from 'server/middlewares/args-q'
import parseUrlFromPath from 'server/middlewares/url-p'
import join from 'server/middlewares/utils/join'

import da from 'services/da'

const router = express()

router.get('/:slug/*', join(
  async (req, res, next) => {
    req._params = {}

    next()
  },
  async (req, res, next) => {
    const { slug } = req.params

    const project = req._params.project = await da.getProject(slug)

    if (!project) {
      return res.sendStatus(400)
    }

    next()
  },
  parseUrlFromPath,
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
  handleRequest,
  async (req, res, next) => {
    res.json(req._params)
  }
))

export default router
