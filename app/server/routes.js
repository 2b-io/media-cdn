import fs from 'fs'

import preset from './middlewares/args/preset'
import project from './middlewares/args/project'
import src from './middlewares/args/src'
import width from './middlewares/args/width'

import s3 from 'infrastructure/s3'
import Media from 'entities/Media'

const mediaHandler = (req, res, next) => {
  const { preset, project, src, width } = req._args

  const media = Media.create({
    preset,
    project,
    src,
    width
  })

  s3
    .meta(media.props.remoteTarget)
    .catch(() => null)
    .then(meta => {

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
      .onResponse(message => {
        mediaHandler(req, res, next)

        console.log('clearing tmp files...')
        fs.unlinkSync(media.props.localOriginal)
        fs.unlinkSync(media.props.localTarget)
        console.log('clear tmp files done')
      })
      .send()
    })
}

const flow = [
  project,
  preset,
  src,
  width,
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
  app.get(
    '/p/:slug/:hash/media',
    flow
  )

  app.get(
    '/p/:slug/media',
    flow
  )

  app.use((error, req, res, next) => res.sendStatus(500))

  return app
}
