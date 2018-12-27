import config from 'infrastructure/config'
import apiService from 'services/api'
import cacheService from 'services/cache-request'

const get = async (projectIdentifier, contentType) => {
  const cache = cacheService.create('CONTENT-TYPE')

  return await cache.get(projectIdentifier, config.cacheDuration, async () => {
    return await apiService.callApi('get', `/projects/${ projectIdentifier }/presets/${ encodeURIComponent(contentType) }`)
  })
}
export default {
  get
}
