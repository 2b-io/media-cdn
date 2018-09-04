import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import cache from 'services/cache'

export default async (req, res) => {
  const { slug, id } = req.params

  try {
    await cache.deleteAll(`${ config.version }/${ slug }/${ id }`)
    await cache.invalid([ `/u/${ slug }/${ id }`, `/p/${ slug }/${ id }` ])
    res.status(204).json({})
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
