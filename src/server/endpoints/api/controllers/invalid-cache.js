import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import cache from 'services/cache'
import { get as getPullSetting } from 'services/pull-setting'
import { getProjectByIdentifier } from 'services/project'
import { searchOriginUrl } from 'services/elastic-search'

export default async (req, res) => {
  try {
    const { patterns } = req.body
    const { identifier } = req.params
    if (!patterns.length) {
      return res.status(201).json({ succeed: true })
    }

    let allObjects = []
    await patterns.reduce(
      async (previousJob, pattern) => {
        await previousJob
        const objects = await searchOriginUrl({ identifier, originUrl: pattern })
        allObjects = allObjects.concat(objects)
        return objects

      },Promise.resolve()
    )
    const { _id: _project } = await getProjectByIdentifier(identifier)
    const { pullURL } = await getPullSetting(_project)

    // delete on s3
    if (allObjects.length) {
      const keys = allObjects.map(({ _source }) => _source )
      await cache.delete(keys)
    }

    // delete on cloudfront
    const cloudfrontPatterns = patterns
      .map(
        (pattern) => {
          const withoutQuerystring = pattern.split('?').shift()

          return {
            universal: [
              `/u/${ identifier }?url=${ withoutQuerystring }*`,
              `/u/${ identifier }?*url=${ withoutQuerystring }*`,
              `/u/${ identifier }?url=${ encodeURIComponent(withoutQuerystring) }*`,
              `/u/${ identifier }?*url=${ encodeURIComponent(withoutQuerystring) }*`,
              `/u/${ identifier }?url=${ encodeURIComponent(pattern) }*`,
              `/u/${ identifier }?*url=${ encodeURIComponent(pattern) }*`
            ],
            pretty: pullURL && pattern.indexOf(pullURL) === 0 ?
              `/p/${ identifier }${ pattern.replace(pullURL, '') }` :
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
      await cache.invalid(cloudfrontPatterns)
    }

    return res.status(201).json({ succeed: true })
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
