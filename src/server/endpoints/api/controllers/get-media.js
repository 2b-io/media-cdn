import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import { getObject } from 'services/media'

export default async (req, res) => {
  const { slug } = req.headers
  const { id } = req.params
  try {
    const object = await getObject(`${ config.version }/${ slug }/${ id }`)
    res.status(200).json(object)
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
