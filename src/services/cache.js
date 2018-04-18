import fs from 'fs-extra'
import mime from 'mime'
import ms from 'ms'
import path from 'path'
import uuid from 'uuid'
import config from 'infrastructure/config'
import s3 from 'infrastructure/s3'


export default {
  head: async (key) => {
    console.log(`cache.js: HEAD /${key}`)

    console.log('cache.js: CACHE MISS')
    return null

    return await s3.headObject({
      Bucket: s3.config.bucket,
      Key: key
    }).promise()
  },
  put: async (key, file) => {
    console.log('cache.js: PUT', file)

    return await s3.putObject({
      Bucket: s3.config.bucket,
      Key: key,
      ContentType: file.contentType || 'application/octet-stream',
      CacheControl: `max-age=${ms('1d') / 1000}`,
      Body: fs.createReadStream(file.path)
    }).promise()
  },
  get: async (key) => {
    const today = new Date()
    const downloadPath = path.join(
      config.tmpDir,
      `${today.getFullYear()}`,
      `${today.getMonth()}`,
      uuid.v4()
    )
    const res = {}

    const data = await s3.getObject({
      Bucket: s3.config.bucket,
      Key: key
    }).promise()

    res.contentType = data.ContentType
    res.ext = mime.getExtension(res.contentType)
    res.path = `${downloadPath}.${res.ext}`

    await fs.outputFile(res.path, data.Body)

    return res
  }
}
