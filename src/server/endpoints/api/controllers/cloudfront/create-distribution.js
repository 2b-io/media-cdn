import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import cloudFront from 'services/cloudfront/distribution'

const {
  targetOriginId,
  targetOriginDomain
} = config.aws.cloudFront

export default async (req, res) => {
  try {
    const { identifier } = req.body

    const comment = `${ config.development ? 'DEV:' : '' }${ identifier }`

    const {
      distribution,
      domain
    } = await cloudFront.create(identifier, {
      targetOriginId,
      targetOriginDomain,
      comment
    })

    res.status(201).json({
      distribution,
      domain
    })
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
