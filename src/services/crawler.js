import fs from 'fs-extra'
import got from 'got'
import mkdirp from 'mkdirp'
import mime from 'mime'
import path from 'path'
import { URL } from 'url'
import uuid from 'uuid'

import config from 'infrastructure/config'

const download = async (url, crawlPath) => {
  await fs.ensureDir(path.dirname(crawlPath))

  const response = await new Promise((resolve, reject) => {
    // skip querystring
    const filename = new URL(url).pathname
    const res = {}

    got.stream(url)
      .on('error', reject)
      .on('response', response => {
        const contentType = response.headers['content-type']

        res.contentType = contentType ?
          contentType.split(';').shift() :
          mime.getType(filename)

        if (res.contentType) {
          res.ext = mime.getExtension(contentType)
          res.path = `${crawlPath}.${res.ext}`
        }
      })
      .pipe(fs.createWriteStream(crawlPath))
      .on('error', reject)
      .on('finish', () => resolve(res))
  })

  if (crawlPath !== response.path) {
    await fs.move(crawlPath, response.path)
  }

  return response
}

export default {
  crawl: async (url) => {
    const today = new Date()
    const crawlPath = path.join(
      config.tmpDir,
      `${today.getFullYear()}`,
      `${today.getMonth()}`,
      uuid.v4()
    )

    return await download(url, crawlPath)
  }
}
