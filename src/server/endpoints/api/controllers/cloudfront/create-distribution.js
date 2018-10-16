import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import cloudFront from 'services/cloudfront/distribution'

const {
  targetOriginId,
  targetOriginDomain
} = config.aws.cloudFront

export default async (req, res) => {
  try {
    const {
      cname,
      identifier
    } = req.body

    const comment = `${ config.development ? 'DEV:' : '' }${ identifier }`

    const {
      Distribution: distribution
    } = await cloudFront.create({
      targetOriginId,
      targetOriginDomain,
      comment,
      aliases: [
        `${ identifier }.${ cname }`
      ]
    })

    res.status(201).json(distribution)
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
