import config from 'infrastructure/config'
import cloudFront from 'services/cloudfront/distribution'

const {
  acmCertificateArn,
  targetOriginDomain
} = config.aws.cloudFront

export default async (req, res, next) => {
  try {
    const { identifier } = req.body

    const comment = `${ config.development ? 'DEV:' : '' }${ identifier }`

    const {
      distribution,
      domain
    } = await cloudFront.create(identifier, {
      acmCertificateArn,
      targetOriginDomain,
      comment
    })

    res.status(201).json({
      distribution,
      domain
    })
  } catch (e) {
    next({
      statusCode: 500,
      reason: e
    })
  }
}
