import config from 'infrastructure/config'
import elasticSearch from 'infrastructure/elastic-search'

const INDEX_NAME = `${ config.aws.elasticSearch.prefix }media`
const TYPE_NAME = `${ config.aws.elasticSearch.prefix }media`
const PAGE_FROM = 0
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

export const searchAllObjects = async ({ identifier, params }) => {
  const {
    hits: {
      total,
      hits
    }
  } = await searchByParams({ identifier, params, from: PAGE_FROM, size: PAGE_SIZE })

  if (total < PAGE_SIZE) {
    return hits.map(({ _source }) => _source)
  } else {
    let listResults = []
    for (var i = 0; i <= total; i = i + PAGE_SIZE) {
      const results = await searchByParams({ identifier, params, from: i, size: PAGE_SIZE })
      listResults = listResults.concat(results.hits.hits)
    }

    return listResults.map(({ _source }) => _source)
  }
}
