import aws from 'aws-sdk'
import config from 'infrastructure/config'

export default new aws.CloudFront({
  // distributionId: config.aws.cloudFront.distributionId,
  region: config.aws.cloudFront.region,
  accessKeyId: config.aws.cloudFront.accessKeyId,
  secretAccessKey: config.aws.cloudFront.secretAccessKey,
})
