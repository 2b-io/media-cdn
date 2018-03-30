import Media from 'entities/Media'

export default function processFlow(req, res, next) {
  const { _media:media, _meta:meta } = req

  if (meta) {
    return next()
  }

  const { flow } = req._args

  req.app.get('rpc')
    .request({
      type: 'flow',
      data: { media, flow }
    })
    .waitFor(media.state.uid)
    .onReply(async (error, content) => {
      const succeed = !error && content && content.data && content.data.succeed

      if (!succeed) {
        return next(content.data)
      }

      const media = Media.from(content.data.media)

      req._media = media

      next()
    })
    .send()
}
