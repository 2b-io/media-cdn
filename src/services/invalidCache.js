import serializeError from 'serialize-error'

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

  return await cloudFront.createInvalidation(params, (err, data) => {
    if (err) { return serializeError(err.stack) }
    else { return data }
  }).promise()
}

export default invalidCache
