import cacheSettingService from 'services/cache-setting'

export default async function getCacheSetting(req, res, next) {
  const { project } = req._params

  const cacheSetting = req._params.cacheSetting = await cacheSettingService.get(project.identifier)

  if (!cacheSetting) {
    return next({
      statusCode: 400,
      reason: 'Cache setting not found'
    })
  }

  next()
}
