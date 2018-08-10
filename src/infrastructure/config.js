import env from 'dotenv'
import fs from 'fs-extra'
import path from 'path'

const rootDir = path.resolve(__dirname, '..')
const envPath = path.resolve(rootDir, '../internals/.env')

const envExisted = fs.pathExistsSync(envPath)

if (!envExisted) {
  console.warn(`
    Could not found [ internals/.env ].
    You can create one by copying [ internals/.example.env ]...
  `)

  throw Error('The server should be configured before starting')
}

env.config({
  path: envPath
})

export default {
  __rootDir: rootDir,
  development: process.env.NODE_ENV === 'development',
  version: process.env.VERSION,
  server: {
    base: process.env.BASE_URL,
    bind: process.env.SERVER_BIND,
    port: process.env.SERVER_PORT
  },
  amq: {
    host: process.env.AMQ_HOST,
    prefix: process.env.AMQ_PREFIX
  },
  aws: {
    s3: {
      bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_S3_REGION,
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
    },
    cloudFront: {
      distributionId: process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID,
      region: process.env.AWS_CLOUDFRONT_REGION,
      accessKeyId: process.env.AWS_CLOUDFRONT_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_CLOUDFRONT_SECRET_ACCESS_KEY
    }
  },
  mongodb: process.env.MONGO,
  tmpDir: process.env.TMP_DIR || path.resolve(__dirname, '../../tmp')
}
