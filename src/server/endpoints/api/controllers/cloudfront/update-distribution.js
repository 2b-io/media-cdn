import serializeError from 'serialize-error'

import distribution from 'services/cloudfront/distribution'

export default async (req, res) => {
  const { identifier } = req.params
  const { enabled } = req.body
  console.log('identifier', identifier)
  console.log('enabled', enabled)
  try {
    const distributionInfo = await distribution.update({ identifier, enabled })

    res.status(200).json(distributionInfo)
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
