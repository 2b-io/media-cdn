import boolean from 'boolean'

export default function initAPIHandle(req, res, next) {
  req._args = {
    ...req._args,
    api: true,
    store: boolean(req.body.store || false),
    mime: req.file.mimetype,
    src: {
      pathname: req.file.path,
      toString: () => req.file.path
    }
  }

  next()
}
