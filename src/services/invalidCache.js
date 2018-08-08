import randomstring from 'randomstring'
import cloudFront from 'infrastructure/cloudfront'
import config from 'infrastructure/config'

const invalidCache = (patterns = []) => {

  const reference = randomstring.generate({
    length: 12,
    charset: 'alphabetic'
  })

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

  cloudFront.createInvalidation(params, (err, data) => {
    if (err) console.log(err, err.stack)
    else console.log(data)
  })
}

export default invalidCache
