import express from 'express'
import mime from 'mime'

import flow from '../middlewares/args/flow'
import project from '../middlewares/args/project'
import type from '../middlewares/args/type'
import fetchMediaMeta from '../middlewares/fetch-media-meta'
import processFlow from '../middlewares/process-flow'
import returnMedia from '../middlewares/return-media'

import Media from 'entities/Media'

const router = express()

// router.get('/:slug/:uid\.:ext', (req, res, next) => {
//   res.json(req.params)
// })

router.get([
  '/:slug/:sh/:p/:pv/:m\\_:w\\x:h\.:ext',
  '/:slug/:sh\.:ext'
], [
  project,
  (req, res, next) => {
    const { slug, sh } = req.params

    req._args = {
      ...req._args,
      uid: `${slug}/${sh}`
    }

    next()
  },
  (req, res, next) => {
    const { ext } = req.params
    const { uid } = req._args

    req._args = {
      ...req._args,
      source: `${uid}/source.${ext}`
    }

    next()
  },
  (req, res, next) => {
    const { p, pv, m, w, h, ext } = req.params
    const { uid } = req._args

    if (!p) {
      return next()
    }

    req._args = {
      ...req._args,
      target: `${uid}/${p}/${pv}/${m}_${w}x${h}.${ext}`
    }

    next()
  },
  (req, res, next) => {
    req._args.mime = mime.getType(req._args.source)

    next()
  },
  type,
  flow,
  (req, res, next) => {
    const media = Media.create({
      ...req._args,
      src: {
        pathname: req._args.source,
        toString: () => req._args.source
      }
    })

    media.state.source = req._args.source
    media.state.target = req._args.target

    req._media = media

    next()
  },
  fetchMediaMeta,
  processFlow,
  fetchMediaMeta,
  returnMedia,
  (req, res, next) => {
    res.json({
      meta: req._meta,
      args: req._args,
      media: req._media
    })
  }
])

export default router
