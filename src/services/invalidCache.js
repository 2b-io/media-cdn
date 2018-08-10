import cloudFront from 'infrastructure/cloudfront'
import config from 'infrastructure/config'

const invalidCache = async (patterns = []) => {

  let date = new Date()
  let reference = String(date.getTime())

  const params = {
    DistributionId: config.aws.cloudFront.distributionId,
    InvalidationBatch: {
      CallerReference: reference,
      Paths: {
        Quantity: patterns.length,
        Items: patterns
      }
    }
  }

  return await cloudFront.createInvalidation(params).promise()
}

export default invalidCache
