import express from 'express'
import fs from 'fs'
import mime from 'mime'
import multer from 'multer'
import mv from 'mv'
import path from 'path'
import request from 'superagent'
import uuid from 'uuid'

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
        toString() {
          return req.file.path
        }
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
        console.log(message)

        // res.json(message)

        const { media } = message.data

        const source = path.join(config.tmpDir, media.source)
        const target = path.join(config.tmpDir, media.target)

        res.set('content-type', media.mime)
        res.set('cache-control', 'public, max-age=2592000')
        // fs.createReadStream(file)
        //   .pipe(res)
        //   .on('finish', () => {
        //     console.log('finish')
        //   })
        res.sendFile(target)

        res.on('finish', () => {
          fs.unlink(source, () => {})
          fs.unlink(target, () => {})
        })

      })
      .send()
  }
])

router.get('/test', [
  (req, res, next) => {
    const file = path.join(config.tmpDir, 'test.jpg')
    const url = 'http://d-14:3002/a/the-cool-stuffs/media'

    request
      .post(url)
      .field('store', false)
      .attach('media', fs.createReadStream(file))
      .on('response', response => {
        console.log(response.headers)

        res.set('content-type', response.headers['content-type'])
      })
      .pipe(res)
      .on('finish', () => {
        console.log('yyy')
      })
  }
])

export default router
