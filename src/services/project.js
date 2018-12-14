import ApiService from 'services/api'

class ProjectService extends ApiService {
  async get(projectIdentifier) {
    return await this.callApi('get', `/projects/${ projectIdentifier }`)
  }
}

export default (accountIdentifier) => {
  return new ProjectService('webapp', accountIdentifier)
}
