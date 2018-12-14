import request from 'superagent'

import config from 'infrastructure/config'

class ApiService {
  constructor(appIdentifier, accountIdentifier) {
    this.appIdentifier = appIdentifier
    this.accountIdentifier = accountIdentifier
  }

  async callApi(method, path, body) {
    const authParams = Object.entries({
      app: this.appIdentifier,
      account: this.accountIdentifier
    })
      .map((entry) => entry[ 1 ] && entry.join('='))
      .filter(Boolean)
      .join(',')

    const response = await request(method, `${ config.apiUrl }${ path }`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `MEDIA_CDN ${ authParams }`)
      .send(body)

    return response.body
  }
}

export default ApiService
