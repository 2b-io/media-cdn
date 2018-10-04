import da from 'services/da'

export default async (req, res, next) => {
  const { contentType, project: { _id } } = req._params
  const preset = req._params.preset = await da.getPreset(contentType, _id)
  if (!preset) {
    return next({
      statusCode: 400,
      reason: 'Preset not found'
    })
  }

  next()
}
