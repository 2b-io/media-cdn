import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import cache from 'services/cache'

export default async (req, res) => {
  const { slug } = req.headers
  const { id } = req.params

  try {
    await cache.delete(`${ config.version }/${ slug }/${ id }`)
    res.status(201).json({ succeed: true })
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
