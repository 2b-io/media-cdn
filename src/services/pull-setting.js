import config from 'infrastructure/config'
import apiService from 'services/api'
import cacheService from 'services/cache-request'

const get = async (projectIdentifier) => {
  const cache = cacheService.create('PULL-SETTING')

  return await cache.get(projectIdentifier, config.cacheDuration, async () => {
    return await apiService.callApi('get', `/projects/${ projectIdentifier }/pull-setting`)
  })
}
export default {
  get
}
