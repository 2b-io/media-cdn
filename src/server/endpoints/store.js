import express from 'express'
import mime from 'mime'
import sh from 'shorthash'

import Preset from 'models/Preset'
import Project from 'models/Project'
import cache from 'services/cache'
import join from 'server/middlewares/utils/join'
import handleRequest from 'server/middlewares/handle-request'

const router = express()

router.get([
  '/:slug/:uh/:p/:vh/:m\\_:w\\x:h\.:ext',
  '/:slug/:uh/:m\\_:w\\x:h\.:ext'
], join(
  async (req, res, next) => {
    req._params = {}

    next()
  },
  async (req, res, next) => {
    const {
      slug, ext, vh,
      uh:urlHash,
      p:hash = 'default',
      m:mode,
      w:width,
      h:height
    } = req.params

    let valueHash = vh

    if (!vh) {
      const project = req._params.project = await Project.findOne({
        slug,
        removed: false,
        disabled: false
      }).lean()

      if (!project) {
        return res.sendStatus(400)
      }

      const preset = req._params.preset = await Preset.findOne({
        hash: hash,
        project: project._id,
        removed: false
      }).lean()

      if (!preset) {
        return res.sendStatus(400)
      }

      valueHash = sh.unique(
        JSON.stringify(
          preset.values,
          Object.keys(preset.values).sort()
        )
      )
    }

    req._params = {
      ...req._params,
      origin: `${slug}/${urlHash}`,
      target: `${slug}/${urlHash}/${hash}/${valueHash}/${mode}_${width}x${height}`,
      ext
    }

    next()
  },
  async (req, res, next) => {
    const meta = req._meta = await cache.head(req._params.target)

    if (!meta) {
      return next()
    }

    const { origin, target } = req._params

    const ext = mime.getExtension(meta.ContentType)

    if (ext !== req._params.ext) {
      return res.redirect(`${req.app.mountpath}/${target}.${ext}`)
    }

    console.log(`PIPE ${target}`)

    res.set('accept-ranges', meta.AcceptRanges)
    res.set('content-type', meta.ContentType)
    res.set('content-length', meta.ContentLength)
    res.set('last-modified', meta.LastModified)
    res.set('etag', meta.ETag)
    res.set('cache-control', meta.CacheControl)
    res.set('x-origin-path', `${origin}.${ext}`)
    res.set('x-target-path', `${target}.${ext}`)
    cache.stream(target).pipe(res)
  },
  async (req, res, next) => {
    req._params = {
      ...req._params,
      args: {
        mode: req.params.m,
        width: parseInt(req.params.w, 10) || 'auto',
        height: parseInt(req.params.h, 10) || 'auto'
      }
    }

    next()
  },
  async (req, res, next) => {
    if (req._params.project) {
      return next()
    }

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
  async (req, res, next) => {
    if (req._params.preset) {
      return next()
    }

    const presetHash = req.params.p

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
  handleRequest
))

router.get('/:slug/:uh\.:ext', join(
  async (req, res, next) => {
    const { slug, uh:urlHash, ext } = req.params

    req._params = {
      origin: `${slug}/${urlHash}`,
      ext
    }

    next()
  },
  async (req, res, next) => {
    const meta = req._meta = await cache.head(req._params.origin)

    if (!meta) {
      return res.sendStatus(404)
    }

    next()
  },
  async (req, res, next) => {
    const meta = req._meta

    const ext = mime.getExtension(meta.ContentType)

    if (ext !== req._params.ext) {
      return res.redirect(`${req.app.mountpath}/${req._params.origin}.${ext}`)
    }

    next()
  },
  async (req, res, next) => {
    const meta = req._meta
    const { origin, ext } = req._params

    console.log(`PIPE ${origin}`)

    res.set('accept-ranges', meta.AcceptRanges)
    res.set('content-type', meta.ContentType)
    res.set('content-length', meta.ContentLength)
    res.set('last-modified', meta.LastModified)
    res.set('etag', meta.ETag)
    res.set('cache-control', meta.CacheControl)
    res.set('x-origin-path', `${origin}.${ext}`)
    cache.stream(origin).pipe(res)
  }
))

export default router

