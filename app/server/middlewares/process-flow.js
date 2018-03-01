export default (req, res, next) => {
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
        next(message.data)
      }

      next()
    })
    .send()
}
