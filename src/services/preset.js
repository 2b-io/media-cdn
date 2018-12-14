import ApiService from 'services/api'

class PresetService extends ApiService {
  async get(projectIdentifier, contentType) {
    return await this.callApi('get', `/projects/${ projectIdentifier }/presets/${ encodeURIComponent(contentType) }`)
  }
}

export default (accountIdentifier) => {
  return new PresetService('webapp', accountIdentifier)
}
