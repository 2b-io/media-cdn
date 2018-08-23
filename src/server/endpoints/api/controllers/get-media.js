import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import { getObject } from 'services/cache'

export default async (req, res) => {
  const { slug } = req.headers
  const { id } = req.params

  try {
    const object = await getObject(`${ config.version }/${ slug }/${ id }`)
    if (object) {
      res.status(201).json({ object })
    }
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
