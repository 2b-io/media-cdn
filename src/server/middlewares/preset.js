import createPresetService from 'services/preset'

export default async function getPreset(req, res, next) {
  const {
    contentType,
    project
  } = req._params

  const presetService = createPresetService()
  req._params.preset = await presetService.get(project.identifier, contentType)

  next()
}
