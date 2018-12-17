import request from 'superagent'

import config from 'infrastructure/config'

const callApi = async (method, path, body) => {
  const response = await request(method, `${ config.apiUrl }${ path }`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `MEDIA_CDN app=cdn`)
    .send(body)

  return response.body
}

export default {
  callApi
}
