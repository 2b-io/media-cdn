import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import cache from 'services/cache'

export default async (req, res) => {
  const { identifier, id } = req.params

  try {
    await cache.deleteAll(`${ config.version }/${ identifier }/${ id }`)
    await cache.invalid([ `/u/${ identifier }/${ id }`, `/p/${ identifier }/${ id }` ])
    res.status(204).json({})
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
