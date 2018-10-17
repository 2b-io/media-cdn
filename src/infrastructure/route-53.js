import aws from 'aws-sdk'

import config from 'infrastructure/config'

export default new aws.Route53({
  region: config.aws.route53.region,
  accessKeyId: config.aws.route53.accessKeyId,
  secretAccessKey: config.aws.route53.secretAccessKey
})
