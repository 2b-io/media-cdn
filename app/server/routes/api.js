import express from 'express'
import fs from 'fs'
import mkdirp from 'mkdirp'
import multer from 'multer'
import path from 'path'
import request from 'superagent'
import uuid from 'uuid'
import config from 'infrastructure/config'

import project from '../middlewares/args/project'

const router = express()

router.post('/:slug/media', [
  project,
  (req, res, next) => {
    const { project } = req._args

    multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          const dest = path.join(
            config.tmpDir,
            project.slug,
            uuid.v4()
          )

          mkdirp.sync(dest)

          cb(null, dest)
        },
        filename: (req, file, cb) => {
          cb(null, file.originalname)
        }
      })
    }).single('media')(req, res, next)
  },
  (req, res, next) => {
    res.json({
      file: req.file,
      body: req.body,
      params: req.params,
      query: req.query,
      args: req._args
    })
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
      .then(data => {
        res
          .set('Content-Type', 'application/json')
          .send(data.text)
      })
      .catch(next)
  }
])

export default router
