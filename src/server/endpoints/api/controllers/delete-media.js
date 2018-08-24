import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import { deleteObject } from 'services/media'

export default async (req, res) => {
  const { slug } = req.headers
  const { id } = req.params

  try {
    await deleteObject(`${ config.version }/${ slug }/${ id }`)
    res.status(204).json({})
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
