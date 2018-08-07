import customHeaders from './controllers/custom-headers'
import invalidCache from './controllers/invalid-cache'

export default (app) => {
  app.post('/cache-invalidations', invalidCache)
  app.post('/headers-custom', customHeaders)
}
