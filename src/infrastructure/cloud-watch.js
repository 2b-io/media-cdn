import aws from 'aws-sdk'

import config from 'infrastructure/config'

export default new aws.CloudWatch({
  region: config.aws.cloudFront.region,
  accessKeyId: config.aws.cloudFront.accessKeyId,
  secretAccessKey: config.aws.cloudFront.secretAccessKey
})
