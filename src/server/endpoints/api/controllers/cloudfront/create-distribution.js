import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import distribution from 'services/cloudfront/distribution'

export default async (req, res) => {
  const { targetOriginId, targetOriginDomain } = config.aws.cloudFront
  const { projectName } = req.body
  const { development } = config
  const comment = `${ development? 'dev' : ''  }-${ projectName }`
  try {
    const distributionInfo = await distribution.create({ targetOriginId, targetOriginDomain, comment })

    res.status(201).json(distributionInfo)
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
