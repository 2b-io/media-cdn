import elasticsearch from 'elasticsearch'

import config from 'infrastructure/config'

export default new elasticsearch.Client({
  host: config.aws.elasticSearch.host,
  log: 'trace'
})
