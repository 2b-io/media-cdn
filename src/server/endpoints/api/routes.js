import createDistribution from './controllers/cloudfront/create-distribution'
import deleteDistribution from './controllers/cloudfront/delete-distribution'
import getDistribution from './controllers/cloudfront/get-distribution'
import invalidCache from './controllers/invalid-cache'
import uploadMedia from './controllers/upload-media'
import getListMedia from './controllers/get-list-media'
import deleteMedia from './controllers/delete-media'
import getMedia from './controllers/get-media'
import handleUpload from 'server/middlewares/handle-upload'


export default (app) => {

  app.post('/projects/:slug/cache-invalidations', invalidCache)

  app.post('/projects/distribution', createDistribution)
  app.get('/projects/distribution/:id', getDistribution)
  app.delete('/projects/distribution/:id', deleteDistribution)

  app.post('/projects/:slug/media', handleUpload, uploadMedia)
  app.get('/projects/:slug/media', getListMedia)
  app.get('/projects/:slug/media/:id', getMedia)
  app.delete('/projects/:slug/media/:id', deleteMedia)
}
