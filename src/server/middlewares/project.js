import da from 'services/da'

export default async function getProject(req, res, next) {
  const project = req._params.project = await da.getProject(req.hostname)

  if (!project) {
    return next({
      statusCode: 400,
      reason: 'Project not found'
    })
  }

  next()
}
