import serializeError from 'serialize-error'

import distribution from 'services/cloudfront/distribution'

export default async (req, res) => {
  const { identifier } = req.params

  try {
    const distributionInfo = await distribution.get({ identifier })

    res.status(200).json(distributionInfo)
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
