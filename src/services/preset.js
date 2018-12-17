import apiService from 'services/api'

const get = async (projectIdentifier, contentType) => {
  return await apiService.callApi('get', `/projects/${ projectIdentifier }/presets/${ encodeURIComponent(contentType) }`)
}

export default {
  get
}
