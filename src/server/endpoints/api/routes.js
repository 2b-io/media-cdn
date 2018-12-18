import uploadMedia from './controllers/upload-media'
import getListMedia from './controllers/get-list-media'
import deleteMedia from './controllers/delete-media'
import getMedia from './controllers/get-media'
import handleUpload from 'server/middlewares/handle-upload'

export default (app) => {
  app.post('/projects/:identifier/media', handleUpload, uploadMedia)
  app.get('/projects/:identifier/media', getListMedia)
  app.get('/projects/:identifier/media/:id', getMedia)
  app.delete('/projects/:identifier/media/:id', deleteMedia)
}
