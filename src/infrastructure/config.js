import path from 'path'

const rootDir = path.resolve(__dirname, '..')

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
      region: process.env.AWS_CLOUDFRONT_REGION,
      accessKeyId: process.env.AWS_CLOUDFRONT_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_CLOUDFRONT_SECRET_ACCESS_KEY,
      targetOriginId: process.env.AWS_CLOUDFRONT_TARGET_ORIGIN_ID,
      targetOriginDomain: process.env.AWS_CLOUDFRONT_DOMAIN_NAME
    },
    elasticSearch: {
      host: process.env.AWS_ELASTIC_SEARCH_HOST,
      index: process.env.AWS_ELASTIC_SEARCH_INDEX,
      type: process.env.AWS_ELASTIC_SEARCH_TYPE
    },
    route53: {
      region: process.env.AWS_ROUTE53_REGION,
      accessKeyId: process.env.AWS_ROUTE53_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_ROUTE53_SECRET_ACCESS_KEY,
      hostedZoneId: process.env.AWS_ROUTE53_HOSTED_ZONE_ID
    }
  },
  mongodb: process.env.MONGO,
  scraperUrl: process.env.SCRAPER_URL,
  tmpDir: process.env.TMP_DIR || path.resolve(rootDir, '../tmp')
}
