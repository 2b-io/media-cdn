import config from 'infrastructure/config'
import elasticSearch from 'services/elastic-search'
export default {
  async searchOriginUrl({ originUrl }) {
    return await elasticSearch.search({
      index: config.aws.elasticSearch.index,
      type: config.aws.elasticSearch.type,
      body: {
        query: {
          match: {
            originUrl
          }
        }
      }
    })
  }
}
