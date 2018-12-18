import updateDistribution from './controllers/cloudfront/update-distribution'
import cloudWatch from './controllers/cloud-watch'
import invalidatePresetCache from './controllers/invalidate-preset-cache'
import invalidateProjectCache from './controllers/invalidate-project-cache'
import uploadMedia from './controllers/upload-media'
import getListMedia from './controllers/get-list-media'
import deleteMedia from './controllers/delete-media'
import getMedia from './controllers/get-media'
import handleUpload from 'server/middlewares/handle-upload'

export default (app) => {
  app.post('/projects/:projectIdentifier/cache-invalidations', invalidateProjectCache)
  app.post('/projects/:projectIdentifier/presets/:presetHash/cache-invalidations', invalidatePresetCache)
  app.get('/distributions/:distributionIdentifier/metrics/:name/datapoints', cloudWatch.metric)
  app.post('/projects/:identifier/media', handleUpload, uploadMedia)
  app.get('/projects/:identifier/media', getListMedia)
  app.get('/projects/:identifier/media/:id', getMedia)
  app.delete('/projects/:identifier/media/:id', deleteMedia)
}
