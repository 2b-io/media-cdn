import serializeError from 'serialize-error'

import cache from 'services/cache'
import da from 'services/da'

const invalidateByPatterns = async (projectIdentifier, patterns, {
  deleteOnS3,
  deleteOnDistribution
}) => {
  const project = await da.getProjectByIdentifier(projectIdentifier)
  const { pullURL } = await da.getPullSetting(project._id)

  if (deleteOnS3) {
    const allObjects = await cache.searchByPatterns(projectIdentifier, patterns)

    // delete on s3
    if (allObjects.length) {
      await cache.delete(allObjects)
    }
  }

  if (deleteOnDistribution) {
    // delete on distribution
    const cloudfrontPatterns = patterns
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

    if (!cloudfrontPatterns.length) {
      return
    }

    const { identifier: distributionId } = await da.getInfrastructureByProjectId(project._id)

    await cache.invalidate(distributionId, cloudfrontPatterns)
  }
}

// const invalidByPreset = async ({ identifier, presetHash }) => {
//   const project = await da.getProjectByIdentifier(identifier)
//   const allObjects = await cache.searchByPreset({ identifier, presetHash })
//   // delete on s3
//   if (allObjects.length) {
//     await cache.delete(allObjects)
//   }
//   // delete on cloudfront
//   const { identifier: distributionId } = await da.getInfrastructureByProject({ projectId: project._id })

//   await cache.invalid({ patterns: [ '/*' ], distributionId })
// }

// const invalidByProject = async ({ identifier }) => {
//   const allObjects = await cache.searchByProject({ identifier })
//   // delete on s3
//   if (allObjects.length) {
//     await cache.delete(allObjects)
//   }
// }

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

    if (!patterns) {
      return res.sendStatus(400)

      // return next({
      //   code: 400
      // })
    }

    // if (presetHash) {
    //   await invalidByPreset({ projectIdentifier, presetHash })
    //   return res.status(201).json({ succeed: true })
    // }

    await invalidateByPatterns(projectIdentifier, patterns, options)

    // if (patterns === '/*') {
    //   await invalidByProject({ projectIdentifier })
    // } else {
    //   await invalidByPatterns({ projectIdentifier, patterns })
    // }

    return res.status(201).json({ succeed: true })
  }
  catch (e) {
    res.status(500).json(serializeError(e))

    // return next({
    //   code: 500,
    //   error: e
    // })
  }
}
