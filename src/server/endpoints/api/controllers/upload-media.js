import fs from 'fs-extra'
import sh from 'shorthash'

import serializeError from 'serialize-error'

import cache from 'services/cache'

export default async (req, res) => {
  try {
    const file = {
      contentType: req.file.mimetype,
      path: req.file.path
    }

    const key = sh.unique(req.file.filename)

    await cache.put(key, file, {
      meta: {
        'origin-url': req.file.originalname
      }
    })
    res.status(201).json({ succeed: true })

    await fs.remove(file.path)
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
