import S3 from 'aws-sdk/client/s3'
import fs from 'fs'
import mime from 'mime'
import path from 'path'
import shortHash from 'short-hash'

import config from 'infrastructure/config'

const s3 = new S3(config.aws.s3)

const getKey = (media, original) => {
  return original ? media.originalPath : media.uniquePath
}

export default {
  meta: async (media, original = false) => {
    const key = getKey(media, original)

    const meta = await s3.headObject({
      Bucket: s3.config.bucket,
      Key: key
    }).promise()

    if (meta) {
      media.meta = meta
    }

    return media
  },
  receive: (media, original = false) => {
    const key = getKey(media, original)

    media._receiveRequest = s3.getObject({
      Bucket: s3.config.bucket,
      Key: key
    })

    return media
  },
  store: async (media, original = false) => {
    const key = getKey(media, original)

    await s3.putObject({
      Bucket: s3.config.bucket,
      Key: key,
      ContentType: mime.getType(media.url),
      Body: fs.createReadStream(media.createLocalPath(original))
    }).promise()

    return media
  }
}
