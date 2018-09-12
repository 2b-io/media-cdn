import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import distribution from 'services/cloudfront/distribution'

export default async (req, res) => {
  const { id } = req.params

  try {
    const distributionInfo = await distribution.get({ id })

    res.status(200).json(distributionInfo)
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
