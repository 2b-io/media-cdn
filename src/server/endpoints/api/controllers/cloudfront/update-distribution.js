import cloudFront from 'services/cloudfront/distribution'

export default async (req, res, next) => {
  try {
    const { identifier } = req.params
    const { enabled } = req.body

    const distribution = await cloudFront.update(identifier, {
      enabled
    })

    res.status(200).json(distribution)
  } catch (e) {
    next({
      statusCode: 500,
      reason: e
    })
  }
}
