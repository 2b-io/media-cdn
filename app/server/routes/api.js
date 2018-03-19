import express from 'express'
import mime from 'mime'
import multer from 'multer'
import mv from 'mv'
import path from 'path'

import config from 'infrastructure/config'
import Media from 'entities/Media'

import flow from '../middlewares/args/flow'
import project from '../middlewares/args/project'

const router = express()
const upload = multer({
  dest: config.tmpDir,
})

router.post('/:slug/media', [
  project,
  (req, res, next) => {
    const { project } = req._args

    upload.single('media')(req, res, next)
  },
  (req, res, next) => {
    req._args.mime = req.file.mimetype

    next()
  },
  flow,
  (req, res, next) => {
    const media = Media.create({
      src: {
        pathname: req.file.path,
        toString: () => req.file.path
      },
      ...req._args
    })

    const ext = mime.getExtension(media.state.mime)

    media.state.ext = `.${ext}`
    media.state.source = `${media.state.source}.${ext}`
    media.state.target = `${media.state.target}.${ext}`

    req._media = media

    next()
  },
  (req, res, next) => {
    const { _media: media } = req

    req.app.get('rpc')
      .request('flow', { media, flow: [
        'mv',
        'optimize'
      ] })
      .onResponse(message => {
        const media = req._media = message.data.media

        const source = path.join(config.tmpDir, media.source)
        const target = path.join(config.tmpDir, media.target)
        const filename = `${media.url.split('/').pop()}${media.ext}`

        res.set('content-type', media.mime)
        res.set('cache-control', 'public, max-age=2592000')
        res.set('content-disposition', `inline; filename=${filename}`)

        res.sendFile(target)

        res.on('finish', () => next())
      })
      .send()
  },
  (req, res, next) => {
    req.app.get('rpc')
      .request('flow', {
        media: req._media,
        flow: [ 'clear' ]
      })
      .onResponse(() => {})
      .send()
  }
])

export default router
