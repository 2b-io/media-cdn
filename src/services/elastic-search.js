import config from 'infrastructure/config'
import elasticSearch from 'infrastructure/elastic-search'

const INDEX_NAME = `${ config.aws.elasticSearch.prefix }media`
const TYPE_NAME = `${ config.aws.elasticSearch.prefix }media`
const PAGE_SIZE = 10

const searchByParams = async ({ identifier, params, from, size }) => {
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
                identifier
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

const searchWithoutParams = async ({ identifier, from, size }) => {
  return await elasticSearch.search({
    from,
    size,
    index: INDEX_NAME,
    type: TYPE_NAME,
    body: {
      query: {
        term: {
          identifier
        }
      }
    }
  })
}

const searchAllObjects = async ({ identifier, params }) => {
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
          await searchByParams({ identifier, params, from: totalHits, size: PAGE_SIZE }) :
          await searchWithoutParams({ identifier, from: totalHits, size: PAGE_SIZE })

    totalHits = totalHits + hits.length
    total = _total

    sources = sources.concat(hits.map(({ _source }) => _source))
  } while (totalHits < total)

  return sources
}

export default {
  searchAllObjects
}
