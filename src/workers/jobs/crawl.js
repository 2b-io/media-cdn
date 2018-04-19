import fs from 'fs-extra'
import cache from 'services/cache'
import crawler from 'services/crawler'

export default async (payload) => {
  console.log('crawl...')

  const meta = await cache.head(payload.origin)

  if (!meta) {
    let file

    try {
      file = await crawler.crawl(payload.url)

      await cache.put(payload.origin, file)
    } finally {
      if (file) {
        await fs.remove(file.path)
      }
    }
  }

  console.log('crawl... done')
}
