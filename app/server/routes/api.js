import boolean from 'boolean'
import express from 'express'
import mime from 'mime'
import path from 'path'

import Media from 'entities/Media'
import config from 'infrastructure/config'

import flow from '../middlewares/args/flow'
import preset from '../middlewares/args/preset'
import project from '../middlewares/args/project'
import size from '../middlewares/args/size'
import clear from '../middlewares/clear'

import handleUpload from '../middlewares/handle-upload'
import series from '../middlewares/series'

const router = express()

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
  (req, res, next) => {
    req._args.api = true
    req._args.store = boolean(req.body.store || false)
    req._args.mime = req.file.mimetype

    next()
  },
  flow,
  (req, res, next) => {
    console.log(req._args)

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
  clear
])

export default router
