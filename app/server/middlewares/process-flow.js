import Media from 'entities/Media'

export default function processFlow(req, res, next) {
  const { _media:media, _meta:meta } = req

  if (meta) {
    return next()
  }

  const { flow } = req._args

  req.app.get('rpc')
    .request('flow', { media, flow })
    .waitFor(media.state.uid)
    .onResponse(message => {
      const succeed = message && message.data && message.data.succeed

      if (!succeed) {
        return next(message.data)
      }

      const media = Media.from(message.data.media)

      req._media = media

      next()
    })
    .send()
}
