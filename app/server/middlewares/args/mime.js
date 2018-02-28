import mime from 'mime'

export default (req, res, next) => {
  const { src } = req._args

  req._args.mime = mime.getType(src.pathname)

  next()
}
