import da from 'services/da'

export default async function getProject(req, res, next) {
  const {
    infrastructure,
    project
  } = await da.getProject(req.hostname)

  if (!project) {
    return next({
      statusCode: 400,
      reason: 'Project not found'
    })
  }

  req._params.infrastructure = infrastructure
  req._params.project = project

  next()
}
