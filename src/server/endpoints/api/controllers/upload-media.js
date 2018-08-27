import fs from 'fs-extra'

import serializeError from 'serialize-error'
import sh from 'shorthash'

import formatMediaData from '../media/format-media-data'
import config from 'infrastructure/config'
import cache from 'services/cache'
import { getObject } from 'services/media'

export default async (req, res) => {

  const { slug } = req.params
  const { mimetype, path, originalname } = req.file
  const file = {
    contentType: mimetype,
    path
  }
  const key = sh.unique(originalname)
  const origin = `${ slug }/${ key }`
  try {
    const result = await cache.put(origin, file, {
      meta: {
        'origin-url': ''
      }
    })
    if (result) {
      const s3Object = await getObject(`${ config.version }/${ slug }/${ key }`)
      const mediaData = await formatMediaData(s3Object, slug, key)
      res.status(201).json(mediaData)
    }
  }
  catch (e) {
    res.status(500).json(serializeError(e))
  } finally {
    await fs.remove(path)
  }
}
