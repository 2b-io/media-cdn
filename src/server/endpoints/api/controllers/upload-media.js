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

  try {
    const file = {
      contentType: mimetype,
      path
    }

    await cache.put(origin, file, {
      meta: {
        'origin-url': `${ slug }/${ originalname }.${ ext }`
      }
    })

    res.status(201).json(`${ base }/s/${ origin }.${ ext }`)

    await fs.remove(path)

  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
