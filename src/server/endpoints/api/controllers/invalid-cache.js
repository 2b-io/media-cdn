import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import cache from 'services/cache'
import project from 'services/project'

export default async (req, res) => {
  try {
    const { patterns, slug } = req.body

    if (!patterns.length) {
      return res.status(201).json({ succeed: true })
    }

    // delete all file in project s3 and cloudfront
    if (patterns[0] === '/*') {
      await cache.invalid([`/u/${ slug }/*`, `/p/${ slug }/*`])
      await cache.deleteAll(`${ config.version }/${ slug }`)

      return res.status(201).json({ succeed: true })
    }

    const { prettyOrigin } = await project.get(slug)

    // delete on s3
    const s3Prefix = `${ config.version }/${ slug }`
    const s3Keys = await cache.search(s3Prefix, patterns)

    if (s3Keys.length) {
      await cache.delete(s3Keys)
    }

    // delete on cloudfront
    const cloudfrontPatterns = patterns
      .map(
        (pattern) => {
          const withoutQuerystring = pattern.split('?').shift()

          return {
            universal: [
              `/u/${ slug }?url=${ withoutQuerystring }*`,
              `/u/${ slug }?*url=${ withoutQuerystring }*`,
              `/u/${ slug }?url=${ encodeURIComponent(withoutQuerystring) }*`,
              `/u/${ slug }?*url=${ encodeURIComponent(withoutQuerystring) }*`,
              `/u/${ slug }?url=${ encodeURIComponent(pattern) }*`,
              `/u/${ slug }?*url=${ encodeURIComponent(pattern) }*`
            ],
            pretty: prettyOrigin && pattern.indexOf(prettyOrigin) === 0 ?
              `/p/${ slug }${ pattern.replace(prettyOrigin, '') }` :
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
    console.log("e", e);
    res.status(500).json(serializeError(e))
  }
}
