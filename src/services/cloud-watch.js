import cloudWatch from 'infrastructure/cloud-watch'

const METRIC_NAME = {
  BYTES_DOWNLOADED: 'BytesDownloaded',
  REQUESTS: 'Requests'
}

const METRIC_LABEL = {
  BytesDownloaded: 'BYTES_DOWNLOADED',
  Requests: 'REQUESTS'
}

const formatResponseData = async (responseData) => {
  return await {
    name: METRIC_LABEL[ responseData.Label ],
    datapoints: responseData.Datapoints.map(({
      Timestamp,
      Sum,
      Average
    }) => {
        if (responseData.Label === 'Requests') {
          return {
            value: Sum ? Sum : Average,
            timestamp: Date.parse(Timestamp)
          }
        } else {
          return {
            value: Sum,
            timestamp: Date.parse(Timestamp)
          }
        }
      }
    )
  }
}

const formatRequestParams = ({
  name,
  endTime,
  startTime,
  period,
  distributionIdentifier,
  statistics = [ 'Sum' ]
}) => ({
  Namespace: 'AWS/CloudFront',
  MetricName: METRIC_NAME[ name ],
  StartTime: new Date(Number(startTime)).toISOString(),
  EndTime: new Date(Number(endTime)).toISOString(),
  Period: period,
  Dimensions: [
    {
      Name: 'DistributionId',
      Value: distributionIdentifier
    },
    {
      Name: 'Region',
      Value: 'Global'
    }
  ],
  Statistics: statistics
})

const getMetric = async (params) => {
  const responseData = await cloudWatch.getMetricStatistics(
    formatRequestParams(params)
  ).promise()

  return await formatResponseData(responseData)
}

export default {
  getMetric
}
