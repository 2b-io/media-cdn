export default function generateOriginPath(req, res, next) {
  const { project: { identifier }, hashedURL } = req._params

  req._params.origin = `${ identifier }/${ hashedURL }`

  next()
}
