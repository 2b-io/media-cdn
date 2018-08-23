import invalidCache from './controllers/invalid-cache'
import uploadMedia from './controllers/upload-media'
import getListMedia from './controllers/get-list-media'
import deleteMedia from './controllers/delete-media'
import getMedia from './controllers/get-media'
import handleUpload from 'server/middlewares/handle-upload'


export default (app) => {
  app.post('/cache-invalidations', invalidCache)
  app.post('/media', handleUpload, uploadMedia)
  app.get('/media', getListMedia)
  app.get('/media/:id', getMedia)
  app.delete('/media/:id', deleteMedia)
}
