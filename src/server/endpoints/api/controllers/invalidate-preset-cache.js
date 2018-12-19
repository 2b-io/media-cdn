import cache from 'services/cache'
import infrastructureService from 'services/infrastructure'

const invalidateByPreset = async (projectIdentifier, presetHash) => {
  const allObjects = await cache.searchByPresetHash(projectIdentifier, presetHash)

  // delete on s3
  if (allObjects.length) {
    await cache.delete(allObjects)
  }

  // delete on cloudfront
  const { ref: distributionId } = await infrastructureService.get(projectIdentifier)

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
