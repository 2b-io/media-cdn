import ApiServices from 'services/api'

class InfrastructureService extends ApiServices {
  async get(projectIdentifier) {
    return await this.callApi('get', `/projects/${ projectIdentifier }/infrastructure`)
  }
}

export default (accountIdentifier) => {
  return new InfrastructureService('webapp', accountIdentifier)
}
