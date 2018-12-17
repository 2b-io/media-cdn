import apiService from 'services/api'

const get = async (projectIdentifier) => {
  return await apiService.callApi('get', `/projects/${ projectIdentifier }/pull-setting`)
}

const update = async (projectIdentifier, body) => {
  return await apiService.callApi('put', `/projects/${ projectIdentifier }/pull-setting`, body)
}

export default {
  get,
  update
}
