import config from 'infrastructure/config'
import apiService from 'services/api'
import cacheService from 'services/cache-request'

const get = async (projectIdentifier) => {
  const cache = cacheService.create('CACHE-SETTING')

  return await cache.get(projectIdentifier, config.cacheDuration, async () => {
    return apiService.callApi('get', `/projects/${ projectIdentifier }/cache-setting`)
  })
}
export default {
  get
}
