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
  '/:slug/:uh/:p/:vh/:m\\_:w\\x:h\.:ext'
], (req, res, next) => {
  const {
    slug, ext,
    uh:urlHash,
    p:hash = 'default',
    m:mode,
    w:width,
    h:height
  } = req.params

  res.redirect(`${req.app.mountpath}/${slug}/${urlHash}/${hash}/${mode}_${width}x${height}.${ext}`)
})

router.get([
  '/:slug/:uh/:p/:m\\_:w\\x:h\.:ext',
  '/:slug/:uh/:m\\_:w\\x:h\.:ext'
], join(
  async (req, res, next) => {
    req._params = {
      slug: req.params.slug,
      hash: req.params.p || 'default'
    }

    next()
  },
  getProject,
  getPreset,
  async (req, res, next) => {
    const {
      slug, ext, vh,
      uh:urlHash,
      p:hash = 'default',
      m:mode,
      w:width,
      h:height
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
      origin: `${slug}/${urlHash}`,
      target: `${slug}/${urlHash}/${hash}/${valueHash}/${mode}_${width}x${height}`,
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
    res.set('x-origin-path', staticPath.origin(req._params))
    res.set('x-target-path', staticPath.target(req._params))
    cache.stream(target).pipe(res)
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

