import da from 'services/da'

export default async function getPullSetting(req, res, next) {
  const { project } = req._params

  const pullSetting = req._params.pullSetting = await da.getPullSetting(project._id)

  if (!pullSetting) {
    return next({
      statusCode: 400,
      reason: 'Pull setting not found'
    })
  }

  next()
}
