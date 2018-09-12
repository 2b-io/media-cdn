import serializeError from 'serialize-error'

import distribution from 'services/cloudfront/distribution'

export default async (req, res) => {
  const { id } = req.params

  try {
    const distributionInfo = await distribution.delete({ id })

    res.status(204).json(distributionInfo)
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
