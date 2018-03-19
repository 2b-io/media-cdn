import express from 'express'
import fs from 'fs'
import path from 'path'
import request from 'superagent'

import config from 'infrastructure/config'

const router = express()
const forwardHeaders = [
  'content-disposition',
  'content-type',
  'cache-control',
  'accept-ranges',
  'last-modified',
  'etag',
  'content-length',
  'date'
]

router.get('/test', [
  (req, res, next) => {
    const file = path.join(config.tmpDir, 'test.css')
    const url = 'http://d-14:3002/a/the-cool-stuffs/media'

    request
      .post(url)
      .field('store', true)
      .field('w', 640)
      .field('h', 640)
      .field('m', 'crop')
      .attach('media', fs.createReadStream(file))
      .on('response', response => {
        forwardHeaders.forEach(h => {
          if (!response.headers[h]) return

          res.set(h, response.headers[h])
        })
      })
      .pipe(res)
  }
])

export default router
