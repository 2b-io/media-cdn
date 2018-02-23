import fs from 'fs'
import morgan from 'morgan'

import force from './middlewares/args/force'
import preset from './middlewares/args/preset'
import project from './middlewares/args/project'
import src from './middlewares/args/src'
import width from './middlewares/args/width'

import s3 from 'infrastructure/s3'
import Media from 'entities/Media'

const mediaHandler = (req, res, next) => {
  const { force, preset, project, src, width } = req._args

  const media = Media.create({
    preset,
    project,
    src,
    width
  })

  const getMeta = force ?
    Promise.resolve(null) :
    s3.meta(media.props.remoteTarget).catch(() => null)

  getMeta.then(meta => {
    if (meta) {
      res.set('Content-Type', meta.ContentType);
      res.set('Content-Length', meta.ContentLength);
      res.set('Last-Modified', meta.LastModified);
      res.set('ETag', meta.ETag);
      res.set('Cache-Control', 'public, max-age=2592000');
      res.set('Expires', new Date(Date.now() + 2592000000).toUTCString());

      s3.receive(media.props.remoteTarget).pipe(res)

      return
    }

    const rpc = req.app.get('rpc')

    rpc.request('process-media', {
      media: media.toJSON(),
      options: preset.values
    })
    .waitFor(media.props.uid)
    .onResponse(response => {
      console.log('clearing tmp files...')
      fs.unlink(media.props.localOriginal, () => {})
      fs.unlink(media.props.localTarget, () => {})
      console.log('clear tmp files done')

      if (response.data.succeed) {
        req._args.force = false

        return mediaHandler(req, res, next)
      }

      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      res.set('Pragma', 'no-cache')
      res.set('Expires', '0')
      res.set('Surrogate-Control', 'no-store')
      res.status(400).json(response.data)
    })
    .send()
  })
}

const flow = [
  project,
  preset,
  src,
  width,
  force,
  (req, res, next) => {
    const { preset, project, src, width } = req._args

    if (!preset || !project || !src || !width) {
      return res.sendStatus(400)
    }

    next()
  },
  mediaHandler
]

export default app => {
  // devlopment log
  app.use(morgan('dev'))

  // register hook
  app.use((req, res, next) => {
    // req.on('end', () => console.log('end', res.statusCode))

    next()
  })

  // supported endpoints
  app.get('/p/:slug/:hash/media', flow)
  app.get('/p/:slug/media', flow)

  // otherwise
  app.use((error, req, res, next) => {
    res.sendStatus(400)
  })

  return app
}
