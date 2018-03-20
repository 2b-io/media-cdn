import aws from 'aws-sdk'
import fs from 'fs'
import mime from 'mime'
import path from 'path'
import shortHash from 'short-hash'

import config from 'infrastructure/config'

const s3 = new aws.S3({
  ...config.aws.s3
})

const getKey = (media, original) => {
  return original ? media.originalPath : media.uniquePath
}

export default {
  meta: async (key) => {
    return await s3.headObject({
      Bucket: s3.config.bucket,
      Key: key
    }).promise()
  },
  store: async (local, remote) => {
    return await s3.putObject({
      Bucket: s3.config.bucket,
      Key: remote,
      ContentType: mime.getType(local),
      // TODO ContentDisposition: `inline; filename=???`,
      Body: fs.createReadStream(local)
    }).promise()
  },
  receive: remote => {
    return s3.getObject({
      Bucket: s3.config.bucket,
      Key: remote
    }).createReadStream()
  }
}
