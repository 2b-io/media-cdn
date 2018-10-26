import config from 'infrastructure/config'
import elasticSearch from 'infrastructure/elastic-search'

const PREFIX = config.aws.elasticSearch.prefix
const TYPE_NAME = `${ PREFIX }-media`
const PAGE_SIZE = 10

const searchWithParams = async ({ projectIdentifier, params, from, size }) => {
  return await elasticSearch.search({
    from,
    size,
    index: `${ PREFIX }-${ projectIdentifier }`,
    type: TYPE_NAME,
    body: {
      query: {
        ...params
      }
    }
  })
}

const searchWithoutParams = async ({ projectIdentifier, from, size }) => {
  return await elasticSearch.search({
    from,
    size,
    index: `${ PREFIX }-${ projectIdentifier }`,
    type: TYPE_NAME
  })
}

const searchAllObjects = async ({ projectIdentifier, params }) => {
  const projectExists = await elasticSearch.indices.exists({
    index: `${ PREFIX }-${ projectIdentifier }`
  })

  if (!projectExists) {
    return []
  }

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
