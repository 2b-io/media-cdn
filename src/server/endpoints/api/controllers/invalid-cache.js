import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import cache from 'services/cache'
import da from 'services/da'

export default async (req, res) => {
  try {
    const { patterns } = req.body
    const { identifier } = req.params

    if (!patterns.length) {
      return res.status(201).json({ succeed: true })
    }
    
    const project = await da.getProjectByIdentifier(identifier)
    const { pullURL } = await da.getPullSetting(project._id)
    const allObjects = await cache.search({ identifier, patterns })
    // delete on s3
    if (allObjects.length) {
      await cache.delete(allObjects)
    }
    // delete on cloudfront
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
                `/${ pattern.replace(pullURL, '') }` :
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
                `/${ pattern.replace(pullURL, '') }` :
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

    if (cloudfrontPatterns.length) {
      const { identifier: distributionId } = await da.getInfrastructure({ project: project._id })
      await cache.invalid({ patterns: cloudfrontPatterns, distributionId })
    }

    return res.status(201).json({ succeed: true })
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
