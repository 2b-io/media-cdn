import express from 'express'
import mime from 'mime'
import sh from 'shorthash'

import cache from 'services/cache'
import staticPath from 'services/static-path'
import join from 'server/middlewares/utils/join'
import getPreset from 'server/middlewares/preset'
import getProject from 'server/middlewares/project'
import handleRequest from 'server/middlewares/handle-request'

const router = express()

router.get([
  '/:identifier/:uh/:p/:m\\_:w\\x:h.:ext?',
  '/:identifier/:uh/:m\\_:w\\x:h.:ext?'
], join(
  async (req, res, next) => {
    req._params = {
      identifier: req.params.identifier,
      hash: req.params.p || 'default'
    }

    next()
  },
  async (req, res, next) => {
    const { m } = req.params

    if (m !== 'cover' && m !== 'contain' && m !== 'crop') {
      return res.sendStatus(400)
    }

    next()
  },
  getProject,
  getPreset,
  async (req, res, next) => {
    const {
      identifier, ext,
      uh: urlHash,
      p: hash = 'default',
      m: mode,
      w: width,
      h: height
    } = req.params

    const { preset } = req._params

    const valueHash = sh.unique(
      JSON.stringify(
        preset.values,
        Object.keys(preset.values).sort()
      )
    )

    req._params = {
      ...req._params,
      origin: `${ identifier }/${ urlHash }`,
      target: `${ identifier }/${ urlHash }/${ hash }/${ valueHash }/${ mode }_${ width }x${ height }`,
      ext
    }

    next()
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
    const meta = req._meta = await cache.head(req._params.target)

    if (!meta) {
      return next()
    }

    const { target } = req._params

    const ext = mime.getExtension(meta.ContentType)
    const params = { ...req._params, ext }

    if (ext !== req._params.ext) {
      return res.redirect(staticPath.target(params))
    }

    console.log(`PIPE ${ target }`)

    res.set('accept-ranges', meta.AcceptRanges)
    res.set('content-type', meta.ContentType)
    res.set('content-length', meta.ContentLength)
    res.set('last-modified', meta.LastModified)
    res.set('cache-control', meta.CacheControl)
    res.set('x-origin-path', staticPath.origin(params))
    res.set('x-target-path', staticPath.target(params))
    cache.stream(target).pipe(res)
  },
  handleRequest
))

router.get('/:identifier/:uh.:ext?', join(
  async (req, res, next) => {
    const { ext, identifier, uh: urlHash } = req.params

    req._params = {
      ext,
      origin: `${ identifier }/${ urlHash }`
    }

    next()
  },
  async (req, res, next) => {
    const meta = req._meta = await cache.head(req._params.origin)

    if (!meta) {
      return next({
        statusCode: 404,
        reason: 'Not found'
      })
    }

    next()
  },
  async (req, res, next) => {
    const meta = req._meta

    const ext = mime.getExtension(meta.ContentType)
    const params = { ...req._params, ext }

    if (ext !== req._params.ext) {
      return res.redirect(staticPath.origin(params))
    }

    next()
  },
  async (req, res) => {
    const meta = req._meta
    const { origin } = req._params

    console.log(`PIPE ${ origin }`)

    res.set('accept-ranges', meta.AcceptRanges)
    res.set('content-type', meta.ContentType)
    res.set('content-length', meta.ContentLength)
    res.set('last-modified', meta.LastModified)
    res.set('cache-control', meta.CacheControl)
    res.set('x-origin-path', staticPath.origin(req._params))
    cache.stream(origin).pipe(res)
  }
))

export default router
