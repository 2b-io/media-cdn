import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import cache from 'services/cache'

export default async (req, res) => {
  try {
    await cache.invalid(req.body.patterns)
    const originUrls = req.body.originUrls
    if (originUrls.length) {
      originUrls.map(async (originUrl) => {
        const params = { prefix: `${ config.version }/${ req.body.slug }`, originUrl }
        const listFiles = await cache.search(params)
        if (listFiles.length) {
          listFiles.forEach((file) => {
            cache.delete(file.path)
          })
        } else {
          cache.delete(listFiles.path)
        }
      })
    }
    res.status(201).json({
      succeed: true
    })
  } catch (e) {
    res.status(500).json(
      serializeError(e)
    )
  }
}
