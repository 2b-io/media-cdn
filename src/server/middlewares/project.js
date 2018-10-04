import da from 'services/da'

export default async function getProject(req, res, next) {
  const { identifier } = req._params

  const project = req._params.project = await da.getProject(identifier)

  if (!project) {
    return next({
      statusCode: 400,
      reason: 'Project not found'
    })
  }

  next()
}
