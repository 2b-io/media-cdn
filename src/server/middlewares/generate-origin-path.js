export default async function generateOriginPath(req, res, next) {

  const { project: { identifier }, urlHash } = req._params

  req._params.origin = `${ identifier }/${ urlHash }`

  next()

}
