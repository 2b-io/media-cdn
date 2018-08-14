import serializeError from 'serialize-error'

import { standardizePretty, standardizeUniversal } from 'common/standardize'
import config from 'infrastructure/config'
import cache from 'services/cache'
import project from 'services/project'

export default async (req, res) => {

  try {
    const { patterns, slug } = req.body
    const patternsCloudfront = []
    if (patterns.length) {
      await patterns.map( async (pattern) => {

        const { prettyOrigin } = await project.get(slug)

        if (prettyOrigin) {
          patternsCloudfront.push(standardizePretty(pattern, slug))
        }else {
          patternsCloudfront.push(standardizeUniversal(pattern, slug))
        }

        const params = { prefix: `${ config.version }/${ req.body.slug }`, pattern }
        const listFiles = await cache.search(params)
        if (!listFiles) {
          return
        }
        if (listFiles.length) {
          listFiles.forEach((file) => {
            cache.delete(file.Key)
          })
        } else {
          cache.delete(listFiles.Key)
        }
      })

      await cache.invalid(patternsCloudfront)
    }

    res.status(201).json({
      succeed: true
    })
  } catch (e) {
    res.status(500).json(
      serializeError(e)
    )
  }
}
