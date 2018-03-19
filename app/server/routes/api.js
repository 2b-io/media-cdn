import boolean from 'boolean'
import express from 'express'
import mime from 'mime'
import path from 'path'

import Media from 'entities/Media'
import config from 'infrastructure/config'

import flow from '../middlewares/args/flow'
import project from '../middlewares/args/project'
import type from '../middlewares/args/type'
import clear from '../middlewares/clear'
import processFlow from '../middlewares/process-flow'

import handleUpload from '../middlewares/handle-upload'
import series from '../middlewares/series'

const router = express()

const collectUploadArgs = (req, res, next) => {
  req._args.api = true
  req._args.store = boolean(req.body.store || false)
  req._args.mime = req.file.mimetype

  next()
}

const createUploadMediaEntity = (req, res, next) => {
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

  if (media.state.target) {
    media.state.target = `${media.state.target}.${ext}`
  }

  req._media = media

  next()
}

const returnLocalMedia = (req, res, next) => {
  const { _media: media } = req

  const target = path.join(config.tmpDir, media.state.target || media.state.source)
  const filename = `${media.state.url.split('/').pop()}${media.state.ext}`

  res.set('content-type', media.state.mime)
  res.set('cache-control', 'public, max-age=2592000')

  if (!req._args.store) {
    res.set('content-disposition', `inline; filename=${filename}`)
  }

  res.sendFile(target)

  res.on('finish', () => next())
}

/*
  Form Data:
  + store:
    + true -> return JSON
    + false -> return blob
  + media: blob
  + w/width: done
  + h/height: done
  + m/mode: done
  + p/preset: done
*/
router.post('/:slug/media', [
  project,
  handleUpload,
  collectUploadArgs,
  type,
  flow,
  createUploadMediaEntity,
  processFlow,
  returnLocalMedia,
  clear
])

export default router
