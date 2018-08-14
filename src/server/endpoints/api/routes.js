import invalidCache from './controllers/invalid-cache'

export default (app) => {
  app.post('/cache-invalidations', invalidCache)
}
