import da from 'services/da'

export default async function getCacheSetting(req, res, next) {
  const { project } = req._params

  const cacheSetting = req._params.cacheSetting = await da.getCacheSetting(project._id)

  if (!cacheSetting) {
    return next({
      statusCode: 400,
      reason: 'Cache setting not found'
    })
  }

  next()
}
