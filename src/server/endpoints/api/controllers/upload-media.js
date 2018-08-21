import fs from 'fs-extra'
import mime from 'mime'
import sh from 'shorthash'

import config from 'infrastructure/config'
import serializeError from 'serialize-error'
import cache from 'services/cache'

const { server: { base } } = config

export default async (req, res) => {

  const { slug } = req.body
  const { mimetype, filename, path, originalname } = req.file
  const key = sh.unique(filename)
  const origin = `${ slug }/${ key }`
  const ext = mime.getExtension(mimetype)

  const originUrl = ext ?
    `${ slug }/${ originalname }.${ ext }` :
    `${ slug }/${ originalname }`

  const urlHash = ext ?
    `${ base }/s/${ origin }.${ ext }` :
    `${ base }/s/${ origin }`
  try {
    const file = {
      contentType: mimetype,
      path
    }

    await cache.put(origin, file, {
      meta: {
        'origin-url': originUrl
      }
    })

    res.status(201).json(urlHash)

    await fs.remove(path)

  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
