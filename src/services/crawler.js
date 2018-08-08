import fs from 'fs-extra'
import got from 'got'
import mime from 'mime'
import normalizeUrl from 'normalize-url'
import { URL } from 'url'

import config from 'infrastructure/config'
import localpath from 'services/localpath'

const download = async (url, crawlPath, headers) => {

  const response = await new Promise((resolve, reject) => {
    // skip querystring
    const u = new URL(normalizeUrl(url, {
      stripWWW: false
    }))

    const res = {}

    got.stream(u.toString(), { headers: `${ headers }` })
      .on('error', reject)
      .on('response', response => {
        const contentType = response.headers['content-type']

        res.contentType = contentType ?
          contentType.split(';').shift() :
          mime.getType(u.pathname)

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
  crawl: async (url, headers = []) => {
    const crawlPath = await localpath()
    const customHeaders = headers.reduce((result, item) => {
      var key = Object.keys(item)[0]
      result[key] = item[key]
      return result
    }, {})
    return await download(url, crawlPath, customHeaders)
  }
}
