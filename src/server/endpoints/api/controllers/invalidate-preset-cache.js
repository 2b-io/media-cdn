import cache from 'services/cache'
import da from 'services/da'

const invalidateByPreset = async (projectIdentifier, presetHash) => {
  const project = await da.getProjectByIdentifier(projectIdentifier)
  const allObjects = await cache.searchByPresetHash(projectIdentifier, presetHash)

  // delete on s3
  if (allObjects.length) {
    await cache.delete(allObjects)
  }

  // delete on cloudfront
  const { identifier: distributionId } = await da.getInfrastructureByProjectId(project._id)

  await cache.invalidate(distributionId, [ '/*' ])
}

const invalidByProject = async ({ identifier }) => {
  const allObjects = await cache.searchByProject({ identifier })
  // delete on s3
  if (allObjects.length) {
    await cache.delete(allObjects)
  }
}

export default async (req, res, next) => {
  try {
    const { presetHash, projectIdentifier } = req.params

    await invalidateByPreset(projectIdentifier, presetHash)

    return res.status(201).json({ succeed: true })
  } catch (e) {
    return next({
      code: 500,
      error: e
    })
  }
}
