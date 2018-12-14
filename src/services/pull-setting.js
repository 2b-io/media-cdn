import ApiService from 'services/api'

class PullSettingService extends ApiService {
  async get(projectIdentifier) {
    return await this.callApi('get', `/projects/${ projectIdentifier }/pull-setting`)
  }

  async update(projectIdentifier, body) {
    return await this.callApi('put', `/projects/${ projectIdentifier }/pull-setting`, body)
  }
}

export default (accountIdentifier) => {
  return new PullSettingService('webapp', accountIdentifier)
}
