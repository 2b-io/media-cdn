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
  systemPort: process.env.PORT,
  webpackDevServer: process.env.DEV_SERVER,
  mongodb: process.env.MONGO,
  server: {
    base: process.env.DEV_SERVER,
    bind: process.env.BIND,
    port: process.env.PORT
  },
  aws: {
    s3: {
      bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_S3_REGION,
      accessKeyId: process.env.AWS_S3_ACCESSKEYID,
      secretAccessKey: process.env.AWS_S3_SECRETACCESSKEY
    }
  },
  amq: {
    host: process.env.AMQ_HOST,
    prefix: process.env.AMQ_PREFIX
  },
  tmpDir: path.resolve(__dirname, '.../tmp')
}
