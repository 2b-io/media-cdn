import cache from 'services/cache'
import da from 'services/da'
import projectService from 'services/project'

const invalidateByPreset = async (projectIdentifier, presetHash) => {
  const project = await projectService.get(projectIdentifier)
  const allObjects = await cache.searchByPresetHash(projectIdentifier, presetHash)

  // delete on s3
  if (allObjects.length) {
    await cache.delete(allObjects)
  }

  // delete on cloudfront
  const { identifier: distributionId } = await da.getInfrastructureByProjectId(project._id)

  await cache.invalidate(distributionId, [ '/*' ])
}

export default async (req, res, next) => {
  try {
    const { presetHash, projectIdentifier } = req.params

    await invalidateByPreset(projectIdentifier, presetHash)

    return res.status(201).json({ succeed: true })
  } catch (e) {
    return next({
      statusCode: 500,
      reason: e
    })
  }
}
