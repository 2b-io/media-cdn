import invalidCache from './controllers/invalid-cache'
import uploadMedia from './controllers/upload-media'
import getListMedia from './controllers/get-list-media'
import deleteMedia from './controllers/delete-media'
import getMedia from './controllers/get-media'
import handleUpload from 'server/middlewares/handle-upload'


export default (app) => {

  app.post('/projects/:slug/cache-invalidations', invalidCache)

  app.post('/projects/:slug/media', handleUpload, uploadMedia)
  app.get('/projects/:slug/media', getListMedia)
  app.get('/projects/:slug/media/:id', getMedia)
  app.delete('/projects/:slug/media/:id', deleteMedia)
}
