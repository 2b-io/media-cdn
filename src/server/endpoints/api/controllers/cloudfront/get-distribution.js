import cloudFront from 'services/cloudfront/distribution'

export default async (req, res, next) => {
  try {
    const { identifier } = req.params

    const distribution = await cloudFront.get(identifier)

    res.status(200).json(distribution)
  } catch (e) {
    next({
      statusCode: 500,
      reason: e
    })
  }
}
