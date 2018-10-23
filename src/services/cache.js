import escape from 'escape-string-regexp'
import fs from 'fs-extra'
import mime from 'mime'

import { getObjects } from './media'
import cloudFront from 'infrastructure/cloud-front'
import config from 'infrastructure/config'
import s3 from 'infrastructure/s3'
import elasticSearch from 'services/elastic-search'
import localpath from 'services/localpath'

const { version = '0.0.1' } = config

const MAX_KEYS = 1000

export const cloudPath = (key) => `${ version }/${ key }`

export default {
  async head(key, etag) {
    return await s3.headObject({
      Bucket: s3.config.bucket,
      Key: cloudPath(key),
      IfMatch: etag
    }).promise()
  },
  async put(key, file, options = {}) {
    const { expires, meta, ttl } = options

    return await s3.upload({
      Bucket: s3.config.bucket,
      Key: cloudPath(key),
      ContentType: file.contentType || 'application/octet-stream',
      Body: fs.createReadStream(file.path),
      Expires: expires ?
        new Date(expires) : (
          ttl ?
            new Date(Date.now() + ttl * 1000) :
            undefined
        ),
      Metadata: meta || {}
    }).promise()
  },
  async get(key, etag) {
    const downloadPath = await localpath()
    const res = {}

    const data = await s3.getObject({
      Bucket: s3.config.bucket,
      Key: cloudPath(key),
      IfMatch: etag
    }).promise()

    res.contentType = data.ContentType
    res.ext = mime.getExtension(res.contentType)
    res.path = `${ downloadPath }.${ res.ext }`

    await fs.outputFile(res.path, data.Body)

    return res
  },
  async invalidate(distributionId, patterns = []) {
    const params = {
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: Date.now().toString(),
        Paths: {
          Quantity: patterns.length,
          Items: patterns
        }
      }
    }

    return await cloudFront.createInvalidation(params).promise()
  },
  async searchByPatterns(projectIdentifier, patterns) {
    const originObjects = await patterns.reduce(
      async (previousJob, pattern) => {
        const prevObjects = await previousJob || []
        const nextObjects = await elasticSearch.searchAllObjects({
          identifier,
          params: {
            regexp: {
              originUrl: pattern.endsWith('*') ?
                `${ escape(pattern.substring(0, pattern.length - 1)) }.*` :
                `${ escape(pattern) }.*`
            }
          }
        })

        return [ ...prevObjects, ...nextObjects ]
      }, Promise.resolve()
    )

    const allObjects = await originObjects.reduce(
      async (previousJob, { key: originKey }) => {
        const prevObjects = await previousJob || []
        const nextObjects = await elasticSearch.searchAllObjects({
          identifier,
          params: {
            regexp: {
              key: `${ escape(originKey) }.*`
            }
          }
        })

        return [ ...prevObjects, ...nextObjects ]
      }, Promise.resolve()
    )

    return allObjects
  },
  async searchByPresetHash(projectIdentifier, presetHash) {
    return await elasticSearch.searchAllObjects({
      projectIdentifier,
      params: {
        term: {
          preset: presetHash
        }
      }
    })
  },
  async searchByProject(projectIdentifier) {
    return await elasticSearch.searchAllObjects({
      projectIdentifier
    })
  },
  async delete(keys) {
    let keyFrom = 0
    do {
      const subKeys = keys.slice(keyFrom, keyFrom + MAX_KEYS)
      await s3.deleteObjects({
        Bucket: s3.config.bucket,
        Delete: {
          Objects: subKeys.map(({ key }) => ({ Key: key }))
        }
      }).promise()

      keyFrom = keyFrom + subKeys.length
    } while (keyFrom < keys.length)
  },
  stream(key, etag) {
    return s3.getObject({
      Bucket: s3.config.bucket,
      Key: cloudPath(key),
      IfMatch: etag
    }).createReadStream()
  }
}
