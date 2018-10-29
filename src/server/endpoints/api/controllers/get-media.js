import serializeError from 'serialize-error'

import formatMediaData from '../media/format-media-data'
import config from 'infrastructure/config'
import { getObject } from 'services/media'

export default async (req, res) => {
  const { id, identifier } = req.params
  try {
    const s3Object = await getObject(`${ config.version }/${ identifier }/${ id }`)
    const mediaData = await formatMediaData(s3Object, identifier, id)
    res.status(200).json(mediaData)
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
