import serializeError from 'serialize-error'

import formatMediaData from '../media/format-media-data'
import config from 'infrastructure/config'
import { getObjects, getObject } from 'services/media'

export default async (req, res) => {
  const { slug } = req.params

  try {
    const s3Objects = await getObjects(`${ config.version }/${ slug }`)

    const mediaData = await Promise.all(s3Objects.Contents.map( async (_s3Object) => {
      const s3Object = await getObject(_s3Object.Key)
      const key = _s3Object.Key.split('/')[2]
      return await formatMediaData(s3Object, slug, key)
    }))
    res.status(200).json(mediaData)
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
