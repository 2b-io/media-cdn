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
  async search(prefix, patterns) {
    const allObjects = await s3.listObjectsV2({
      Bucket: s3.config.bucket,
      Prefix: prefix
    }).promise()

    if (!allObjects.Contents.length) {
      return []
    }

    // filter top-level objects
    const originObjects = allObjects.Contents
      .filter(
        (object) => object.Key.split('/').length === 3
      )

    // get attached data of each origin object
    const attachedData = await Promise.all(
      originObjects
        .map(
          (object) => s3.headObject({
            Bucket: s3.config.bucket,
            Key: object.Key
          }).promise()
        )
    )

    // merge attached data
    const originObjectsWithData = originObjects.map(
      (origin, index) => ({
        ...origin,
        data: attachedData[ index ]
      })
    )

    // find by patterns
    return patterns
      .map(
        (pattern) => {
          const regex = new RegExp(pattern.replace(/\*/g, '(.+)'))

          return originObjectsWithData
            .filter(
              (object) => regex.test(object.data.Metadata[ 'origin-url' ])
            )
            .map(
              (object) => object.Key
            )
        }
      )
      .reduce(
        (all, keys) => [ ...all, ...keys ]
      )
      .filter(
        (key, index, keys) => keys.indexOf(key) === index
      )
  },
  async deleteAll(prefix) {

    const allObjects = await s3.listObjectsV2({
      Bucket: s3.config.bucket,
      Prefix: prefix
    }).promise()

    if (!allObjects.Contents.length) {
      return []
    }

    return await s3.deleteObjects({
      Bucket: s3.config.bucket,
      Delete: {
        Objects: allObjects.Contents.map(({ Key }) => ({ Key }))
      }
    }).promise()
  },

  async delete(keys) {
    const relatedObjects = await Promise.all(
      keys.map(
        (key) => s3.listObjectsV2({
          Bucket: s3.config.bucket,
          Prefix: key
        }).promise()
      )
    )

    const relatedKeys = relatedObjects
      .map(
        ({ Contents }) => Contents.map(
          (object) => object.Key
        )
      )
      .reduce(
        (allKeys, keys) => [ ...allKeys, ...keys ],
        []
      )

    return await s3.deleteObjects({
      Bucket: s3.config.bucket,
      Delete: {
        Objects: relatedKeys.map((key) => ({ Key: key }))
      }
    }).promise()
  },
  stream(key) {
    return s3.getObject({
      Bucket: s3.config.bucket,
      Key: cloudPath(key)
    }).createReadStream()
  }
}
