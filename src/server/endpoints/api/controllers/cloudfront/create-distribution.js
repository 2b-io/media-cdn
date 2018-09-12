import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import distribution from 'services/cloudfront/distribution'

export default async (req, res) => {
  const { targetOriginId, domainName } = config.aws.cloudFront

  try {
    const distributionInfo = await distribution.create({ options: { targetOriginId, targetOriginDomain } })

    res.status(201).json(distributionInfo)
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
