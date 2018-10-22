import createDistribution from './controllers/cloudfront/create-distribution'
import deleteDistribution from './controllers/cloudfront/delete-distribution'
import getDistribution from './controllers/cloudfront/get-distribution'
import updateDistribution from './controllers/cloudfront/update-distribution'
import invalidCache from './controllers/invalid-cache'
import uploadMedia from './controllers/upload-media'
import getListMedia from './controllers/get-list-media'
import deleteMedia from './controllers/delete-media'
import getMedia from './controllers/get-media'
import handleUpload from 'server/middlewares/handle-upload'

export default (app) => {
  app.post('/projects/:identifier/cache-invalidations', invalidCache)

  app.post('/distributions', createDistribution)
  app.get('/distributions/:identifier', getDistribution)
  app.put('/distributions/:identifier', updateDistribution)
  app.delete('/distributions/:identifier', deleteDistribution)

  app.post('/projects/:identifier/media', handleUpload, uploadMedia)
  app.get('/projects/:identifier/media', getListMedia)
  app.get('/projects/:identifier/media/:id', getMedia)
  app.delete('/projects/:identifier/media/:id', deleteMedia)
}
