import serializeError from 'serialize-error'

import formatMediaData from '../media/format-media-data'
import config from 'infrastructure/config'
import { getObject } from 'services/media'

export default async (req, res) => {
  const { id, slug } = req.params
  try {
    const s3Object = await getObject(`${ config.version }/${ slug }/${ id }`)
    const mediaData = await formatMediaData(s3Object, slug, id)
    res.status(200).json(mediaData)
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
