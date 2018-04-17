import mime from 'mime'

export default function getMimeArg(req, res, next) {
  const { src } = req._args

  req._args.mime = mime.getType(src.pathname)

  next()
}
