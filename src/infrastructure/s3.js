import aws from 'aws-sdk'
import config from 'infrastructure/config'

export default new aws.S3({
  ...config.aws.s3
})
