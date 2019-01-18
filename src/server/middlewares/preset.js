import da from 'services/da'
import mimeAliases from 'services/mime-aliases'

export default async function getPreset(req, res, next) {
  const { contentType, project: { _id } } = req._params
  const mimeType = mimeAliases[ contentType ] || contentType
  req._params.preset = await da.getPreset(mimeType, _id)

  next()
}
