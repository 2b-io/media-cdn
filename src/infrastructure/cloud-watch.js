import aws from 'aws-sdk'

import config from 'infrastructure/config'

export default new aws.CloudWatch({
  region: config.aws.cloudWatch.region,
  accessKeyId: config.aws.cloudWatch.accessKeyId,
  secretAccessKey: config.aws.cloudWatch.secretAccessKey
})
