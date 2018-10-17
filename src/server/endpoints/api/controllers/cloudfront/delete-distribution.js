import serializeError from 'serialize-error'

import cloudFront from 'services/cloudfront/distribution'

export default async (req, res) => {
  try {
    const { identifier } = req.params

    await cloudFront.remove(identifier)

    res.sendStatus(204)
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
