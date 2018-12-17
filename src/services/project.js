import apiService from 'services/api'

const get = async (projectIdentifier) => {
  return await apiService.callApi('get', `/projects/${ projectIdentifier }`)
}

export default {
  get
}
