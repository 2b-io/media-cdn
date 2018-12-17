import presetService from 'services/preset'

export default async function getPreset(req, res, next) {
  const {
    contentType,
    project
  } = req._params

  try {
    req._params.preset = await presetService.get(project.identifier, contentType)
  } catch (e) {
    if (e.status === 404) {
      req._params.preset = null
    } else {
      throw e
    }
  }
  next()
}
