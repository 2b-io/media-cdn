import projectService from 'services/project'
import infrastructureService from 'services/infrastructure'

export default async function getProject(req, res, next) {
  const projectIdentifier = req.hostname.split('.', 1)[ 0 ]

  const project = await projectService.get(projectIdentifier)

  const infrastructure = await infrastructureService.get(projectIdentifier)

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
