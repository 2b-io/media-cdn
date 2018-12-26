import config from 'infrastructure/config'
import apiService from 'services/api'
import cacheService from 'services/cache-request'

const get = async (projectIdentifier) => {
	const cache = cacheService.create('PROJECT')

  return await cache.get(projectIdentifier, config.cacheTimeRequest, async () => {
    return await apiService.callApi('get', `/projects/${ projectIdentifier }`)
	})
}
export default {
  get
}
