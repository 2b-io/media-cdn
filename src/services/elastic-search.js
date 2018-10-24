import config from 'infrastructure/config'
import elasticSearch from 'infrastructure/elastic-search'

const INDEX_NAME = `${ config.aws.elasticSearch.prefix }media`
const TYPE_NAME = `${ config.aws.elasticSearch.prefix }media`
const PAGE_SIZE = 10

const searchWithParams = async ({ projectIdentifier, params, from, size }) => {
  return await elasticSearch.search({
    from,
    size,
    index: INDEX_NAME,
    type: TYPE_NAME,
    body: {
      query: {
        bool: {
          must: [
            {
              term: {
                identifier: projectIdentifier
              }
            }, {
              ...params
            }
          ]
        }
      }
    }
  })
}

const searchWithoutParams = async ({ projectIdentifier, from, size }) => {
  return await elasticSearch.search({
    from,
    size,
    index: INDEX_NAME,
    type: TYPE_NAME,
    body: {
      query: {
        term: {
          identifier: projectIdentifier
        }
      }
    }
  })
}

const searchAllObjects = async ({ projectIdentifier, params }) => {
  let totalHits = 0
  let total = 0
  let sources = []

  do {
    const {
      hits: {
        total: _total,
        hits
      }
    } = params ?
      await searchWithParams({
        projectIdentifier,
        params,
        from: totalHits,
        size: PAGE_SIZE
      }) :
      await searchWithoutParams({
        projectIdentifier,
        from: totalHits,
        size: PAGE_SIZE
      })

    totalHits = totalHits + hits.length
    total = _total

    sources = [
      ...sources,
      ...hits.map(({ _source }) => _source)
    ]
  } while (totalHits < total)

  return sources
}

export default {
  searchAllObjects
}
