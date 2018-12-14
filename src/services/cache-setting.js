import ApiService from 'services/api'

class CacheSettingService extends ApiService {
  async get(projectIdentifier) {
    return await this.callApi('get', `/projects/${ projectIdentifier }/cache-setting`)
  }

  async update(projectIdentifier, body) {
    return await this.callApi('put', `/projects/${ projectIdentifier }/cache-setting`, body)
  }
}

export default (accountIdentifier) => {
  return new CacheSettingService('webapp', accountIdentifier)
}
