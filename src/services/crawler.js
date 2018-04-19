import fs from 'fs-extra'
import got from 'got'
import mime from 'mime'
import { URL } from 'url'

import config from 'infrastructure/config'
import localpath from 'services/localpath'

const download = async (url, crawlPath) => {
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
    const crawlPath = await localpath()

    return await download(url, crawlPath)
  }
}
