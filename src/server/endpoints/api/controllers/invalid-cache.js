import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import cache from 'services/cache'
import { get as getPullSetting } from 'services/pull-setting'
import { getInfrastructure } from 'services/infrastructure'
import { getProjectByIdentifier } from 'services/project'

export default async (req, res) => {
  try {
    const { patterns } = req.body
    const { identifier } = req.params
    if (!patterns.length) {
      return res.status(201).json({ succeed: true })
    }
    const { _id: _project } = await getProjectByIdentifier(identifier)
    const { pullURL } = await getPullSetting(_project)
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

          return {
            universal: [
              `/u/${ identifier }?url=${ withoutQuerystring }*`,
              `/u/${ identifier }?url=${ encodeURIComponent(withoutQuerystring) }*`,
              `/u/${ identifier }?url=${ encodeURIComponent(pattern) }*`,
            ],
            pretty: pullURL && pattern.indexOf(pullURL) === 0 ?
              `/${ identifier }${ pattern.replace(pullURL, '') }` :
              null,
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
      const { identifier: distributionId } = await getInfrastructure({ project: _project })
      await cache.invalid({ patterns: cloudfrontPatterns, distributionId })
    }

    return res.status(201).json({ succeed: true })
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
