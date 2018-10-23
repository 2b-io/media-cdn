import serializeError from 'serialize-error'
import { URL } from 'url'

import cache from 'services/cache'
import da from 'services/da'

const normalizePattern = (path, pullURL) => {
  try {
    return new URL(path, pullURL || undefined).toString()
  } catch (e) {
    return null
  }
}

const invalidateAll = async (projectIdentifier, distributionId) => {
  const allObjects = await cache.searchByProject(projectIdentifier)

  if (allObjects.length) {
    // delete on s3
    await cache.delete(allObjects)
  }

  // delete on distribution
  await cache.invalidate(distributionId, ['/*'])
}

const invalidateByPatterns = async (projectIdentifier, patterns) => {

  const project = await da.getProjectByIdentifier(projectIdentifier)
  const { identifier: distributionId } = await da.getInfrastructureByProjectId(project._id)
  const { pullURL } = await da.getPullSetting(project._id)

  if(patterns.indexOf('*') !== -1 || patterns.indexOf('/*') !== -1 ){
    // delete all file by project
    await invalidateAll(projectIdentifier, distributionId)
    return
  }

  const normalizedPatterns = patterns
    .map(
      (pattern) => normalizePattern(pattern, pullURL)
    )
    .filter(Boolean)

  if (normalizedPatterns.length) {
    const allObjects = await cache.searchByPatterns(projectIdentifier, normalizedPatterns)

    if (allObjects.length) {
      // delete on s3
      await cache.delete(allObjects)
    }

  // delete on distribution
  const cloudfrontPatterns = normalizedPatterns
    .map(
      (pattern) => {
        const withoutQuerystring = pattern.split('?').shift()

        if (pattern.endsWith('*')) {
          return {
            universal: [
              `/u/?url=${ withoutQuerystring }`,
              `/u/?url=${ encodeURIComponent(withoutQuerystring) }`,
              `/u/?url=${ encodeURIComponent(pattern) }`,
            ],
            pretty: pullURL && pattern.indexOf(pullURL) === 0 ?
              `${ pattern.replace(pullURL, '') }` :
              null,
          }
        } else {
          return {
            universal: [
              `/u/?url=${ withoutQuerystring }*`,
              `/u/?url=${ encodeURIComponent(withoutQuerystring) }*`,
              `/u/?url=${ encodeURIComponent(pattern) }*`,
            ],
            pretty: pullURL && pattern.indexOf(pullURL) === 0 ?
              `${ pattern.replace(pullURL, '') }*` :
              null,
          }
        }
      }
    )
    .reduce(
      (cloudfrontPatterns, pattern) => [
        ...cloudfrontPatterns,
        ...pattern.universal,
        pattern.pretty
      ], []
    )
    .filter(Boolean)
    
    await cache.invalidate(distributionId, cloudfrontPatterns)
  } else {
    await cache.invalidate(distributionId, patterns)
  }

}

export default async (req, res, next) => {
  try {
    const {
      options = {
        deleteOnS3: true,
        deleteOnDistribution: true
      },
      patterns
    } = req.body
    const { projectIdentifier } = req.params

    if (!patterns.length) {
      return next({
        code: 400
      })
    }

    await invalidateByPatterns(projectIdentifier, patterns, options)

    return res.status(201).json({ succeed: true })
  }
  catch (e) {
    res.status(500).json(serializeError(e))
  }
}
