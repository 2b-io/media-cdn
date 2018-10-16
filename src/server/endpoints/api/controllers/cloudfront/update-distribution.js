import serializeError from 'serialize-error'

import cloudFront from 'services/cloudfront/distribution'

export default async (req, res) => {
  try {
    const { identifier } = req.params
    const { enabled } = req.body

    const distribution = await cloudFront.update(identifier, {
      enabled
    })

    res.status(200).json(distribution)
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
