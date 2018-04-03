import Media from 'entities/Media'

export default function processFlow(req, res, next) {
  const { _media:media, _meta:meta } = req

  if (meta) {
    return next()
  }

  const { flow } = req._args

  req.app.get('rpc')
    .request()
    .content({
      type: 'flow',
      data: { media, flow }
    })
    .sendTo('worker')
    .waitFor(media.state.uid)
    .onReply(async (error, content) => {
      const succeed = !error && content && content.succeed

      if (!succeed) {
        return next(content)
      }

      const media = Media.from(content.media)

      req._media = media

      next()
    })
    .send()
}
