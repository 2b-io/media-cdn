import fs from 'fs-extra'
import mime from 'mime'
import ms from 'ms'

import cloudFront from 'infrastructure/cloudfront'
import config from 'infrastructure/config'
import s3 from 'infrastructure/s3'
import localpath from 'services/localpath'

const { version = '0.0.1' } = config

export const cloudPath = (key) => `${ version }/${ key }`

export default {
  async head(key) {
    try {
      return await s3.headObject({
        Bucket: s3.config.bucket,
        Key: cloudPath(key)
      }).promise()
    } catch (e) {
      // TODO check not found
      return null
    }
  },
  async put(key, file, options = {}) {
    return await s3.putObject({
      Bucket: s3.config.bucket,
      Key: cloudPath(key),
      ContentType: file.contentType || 'application/octet-stream',
      CacheControl: `max-age=${ ms('7d') / 1000 }`,
      Body: fs.createReadStream(file.path),
      Metadata: options.meta || {}
    }).promise()
  },
  async get(key) {
    const downloadPath = await localpath()
    const res = {}

    const data = await s3.getObject({
      Bucket: s3.config.bucket,
      Key: cloudPath(key)
    }).promise()

    res.contentType = data.ContentType
    res.ext = mime.getExtension(res.contentType)
    res.path = `${ downloadPath }.${ res.ext }`

    await fs.outputFile(res.path, data.Body)

    return res
  },
  async invalid(patterns = []) {
    const date = new Date()
    const reference = String(date.getTime())

    const params = {
      DistributionId: config.aws.cloudFront.distributionId,
      InvalidationBatch: {
        CallerReference: reference,
        Paths: {
          Quantity: patterns.length,
          Items: patterns
        }
      }
    }

    return await cloudFront.createInvalidation(params).promise()
  },
  async search({prefix, pattern}) {
    const listParams = {
      Bucket: config.aws.s3.bucket,
      Prefix: prefix
    }

    const listedObjects = await s3.listObjectsV2(listParams).promise()

    if (!listedObjects.Contents.length) {
      return
    }

    if (pattern.indexOf('*') === -1) {

      return listedObjects.Contents.find(async ({ Key }) => {
        const data = await s3.headObject({ Bucket: config.aws.s3.bucket, Key }).promise()
        if (pattern === data.Metadata[ 'origin-url' ]) {
          return
        }
      })
    }
    const listFiles = await Promise.all(listedObjects.Contents.map(async ({ Key }) => {
      const object = await s3.headObject({ Bucket: config.aws.s3.bucket, Key }).promise()
      return { Key, ...object }
    }))

    const regex = new RegExp(
      pattern.replace(/\*/, '(.+)')
    )
    return listFiles.filter(file => regex.test(file.Metadata['origin-url']))
  },
  async delete(object) {

    const listParams = {
      Bucket: config.aws.s3.bucket,
      Prefix: object
    }

    const listedObjects = await s3.listObjectsV2(listParams).promise()
    if (!listedObjects.Contents.length) {
      return
    }

    const deleteParams = {
      Bucket: config.aws.s3.bucket,
      Delete: { Objects: [] }
    }

    listedObjects.Contents.forEach(async ({ Key }) => {
      deleteParams.Delete.Objects.push({ Key })
    })

    return await s3.deleteObjects(deleteParams).promise()
  },
  stream(key) {
    return s3.getObject({
      Bucket: s3.config.bucket,
      Key: cloudPath(key)
    }).createReadStream()
  }
}
