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
      targetOriginDomain: process.env.AWS_CLOUDFRONT_TARGET_ORIGIN_DOMAIN,
      acmCertificateArn: process.env.AWS_CLOUDFRONT_ACM_CERTIFICATE_ARN
    },
    elasticSearch: {
      host: process.env.AWS_ELASTIC_SEARCH_HOST,
      prefix: process.env.AWS_ELASTIC_SEARCH_PREFIX
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
