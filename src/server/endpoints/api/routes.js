import invalidCache from './controllers/invalid-cache'
import uploadMedia from './controllers/upload-media'
import handleUpload from 'server/middlewares/handle-upload'

export default (app) => {
  app.post('/cache-invalidations', invalidCache)
  app.post('/media', handleUpload, uploadMedia)
}
