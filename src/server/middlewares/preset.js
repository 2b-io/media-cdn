import da from 'services/da'

export default async function getPreset(req, res, next) {
  const { contentType, project: { _id } } = req._params

  req._params.preset = await da.getPreset(contentType, _id)

  next()
}
