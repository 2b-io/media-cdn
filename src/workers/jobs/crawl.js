import fs from 'fs-extra'
import mime from 'mime'
import fetch from 'node-fetch'
import cache, { cloudPath } from 'services/cache'
import crawler from 'services/crawler'

import config from 'infrastructure/config'

const crawlByScraper = async (payload) => {
  const response = await fetch(`${ config.scraperUrl }/pull`, {
    method: 'post',
    body: JSON.stringify({
      ...payload,
      key: cloudPath(payload.origin)
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw 'Crawl failed'
  }

  return await response.json()
}

const crawlByWorker = async (payload) => {
  let file

  try {
    file = await crawler.crawl(payload.url, payload.headers)

    await cache.put(payload.origin, file, {
      meta: {
        'origin-url': payload.url
      }
    })

    return file
  } finally {
    if (file) {
      await fs.remove(file.path)
    }
  }
}


export default async (payload) => {
  const meta = await cache.head(payload.origin)

  if (!meta || true) {
    if (!payload.url) {
      throw new Error('Not crawlable')
    }

    if (config.scraperUrl) {
      return await crawlByScraper(payload)
    } else {
      return await crawlByWorker(payload)
    }
  } else {
    return {
      contentType: meta.ContentType,
      ext: mime.getExtension(meta.ContentType)
    }
  }
}
