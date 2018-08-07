import fs from 'fs-extra'
import mime from 'mime'
import cache from 'services/cache'
import da from 'services/da'
import crawler from 'services/crawler'

export default async (payload) => {
  const meta = await cache.head(payload.origin)

  if (!meta) {
    let file

    try {
      if (!payload.url) {
        throw new Error('Not crawlable')
      }
      const slug = payload.origin.split('/')[0]
      const { headers } = await da.getProject(slug)
      file = await crawler.crawl(payload.url, headers)

      await cache.put(payload.origin, file)

      return file
    } finally {
      if (file) {
        await fs.remove(file.path)
      }
    }
  } else {
    return {
      contentType: meta.ContentType,
      ext: mime.getExtension(meta.ContentType)
    }
  }


}
