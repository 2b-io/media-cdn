import createCacheSettingService from 'services/cache-setting'

export default async function getCacheSetting(req, res, next) {
  const { project } = req._params

  const CacheSettingService = createCacheSettingService()
  const cacheSetting = req._params.cacheSetting = await CacheSettingService.get(project.identifier)

  if (!cacheSetting) {
    return next({
      statusCode: 400,
      reason: 'Cache setting not found'
    })
  }

  next()
}
