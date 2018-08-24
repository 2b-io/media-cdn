import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import { getObjects } from 'services/cache'

export default async (req, res) => {
  const { slug } = req.headers
  try {
    const objects = await getObjects(`${ config.version }/${ slug }`)
    res.status(200).json(objects.Contents)
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
