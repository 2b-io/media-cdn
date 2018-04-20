import express from 'express'

import Preset from 'models/Preset'
import Project from 'models/Project'
import join from 'server/middlewares/utils/join'
import handleRequest from 'server/middlewares/handle-request'
import parseUrlFromPath from 'server/middlewares/url-p'

const router = express()

router.get('/:slug/*', join(
  async (req, res, next) => {
    req._params = {}

    next()
  },
  async (req, res, next) => {
    const { slug } = req.params

    const project = req._params.project = await Project.findOne({
      slug,
      removed: false,
      disabled: false
    }).lean()

    if (!project) {
      return res.sendStatus(400)
    }

    next()
  },
  parseUrlFromPath,
  async (req, res, next) => {
    const presetHash = req.query.p || 'default'

    const preset = req._params.preset = await Preset.findOne({
      hash: presetHash,
      project: req._params.project._id,
      removed: false
    }).lean()

    if (!preset) {
      return res.sendStatus(400)
    }

    next()
  },
  async (req, res, next) => {
    const { query } = req

    req._params.args = {
      mode: query.m || 'cover',
      width: parseInt(query.w || query.width, 10) || undefined,
      height: parseInt(query.h || query.height, 10) || undefined
    }

    next()
  },
  handleRequest,
  async (req, res, next) => {
    res.json(req._params)
  }
))

export default router
