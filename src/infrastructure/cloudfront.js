import aws from 'aws-sdk'
import config from 'infrastructure/config'

export default new aws.CloudFront({
  ...config.aws.cloudFront
})
