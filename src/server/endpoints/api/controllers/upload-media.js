import fs from 'fs-extra'
import mime from 'mime'
import serializeError from 'serialize-error'
import sh from 'shorthash'

import config from 'infrastructure/config'
import cache from 'services/cache'

const { server: { base } } = config

export default async (req, res) => {

  const { slug } = req.body
  const { mimetype, path, originalname } = req.file
  const file = {
    contentType: mimetype,
    path
  }
  const key = sh.unique(originalname)
  const origin = `${ slug }/${ key }`
  const ext = mime.getExtension(mimetype)

  const originUrl = ext ?
    `${ slug }/${ originalname }.${ ext }` :
    `${ slug }/${ originalname }`

  const urlHash = ext ?
    `${ base }/s/${ origin }.${ ext }` :
    `${ base }/s/${ origin }`

  try {
    await cache.put(origin, file, {
      meta: {
        'origin-url': originUrl
      }
    })
    res.status(201).json({ url: urlHash })
  }
  catch (e) {
    res.status(500).json(serializeError(e))
  } finally {
    await fs.remove(path)
  }
}
