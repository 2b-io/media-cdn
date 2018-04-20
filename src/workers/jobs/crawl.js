import fs from 'fs-extra'
import cache from 'services/cache'
import crawler from 'services/crawler'

export default async (payload) => {
  console.log('crawl...')
  console.time('crawl...')

  const meta = await cache.head(payload.origin)

  if (!meta) {
    let file

    try {
      if (!payload.url) {
        throw new Error('Not crawlable')
      }

      file = await crawler.crawl(payload.url)

      await cache.put(payload.origin, file)
    } finally {
      if (file) {
        await fs.remove(file.path)
      }
    }
  }

  console.timeEnd('crawl...')
}
