import config from 'infrastructure/config'
import elasticSearch from 'infrastructure/elastic-search'

export const searchOriginUrl = async ({ identifier, originUrl }) => {
  const response = await elasticSearch.search({
    index: config.aws.elasticSearch.index,
    type: config.aws.elasticSearch.type,
    body: {
      query: {
        bool: {
          must: [
            {
              term: {
                identifier
              }
            }, {
              match: {
                originUrl
              }
            }
          ]
        }
      }
    }
  })
  return response.hits.hits
}
