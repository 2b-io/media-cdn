import ms from 'ms'

import cloudWatch from 'infrastructure/cloud-watch'

const METRIC_NAME = {
  BYTES_DOWNLOADED: 'BytesDownloaded',
  REQUESTS: 'Requests'
}

const METRIC_LABEL = {
  BytesDownloaded: 'BYTES_DOWNLOADED',
  Requests: 'REQUESTS'
}
// TODO: validate time
const generateRangeTimes = (startTime, endTime, period) => {
  const firstDate = new Date(Number(startTime))
  const secondDate = new Date(Number(endTime))
  let dates = []

  if (period === ms('1d') / 1000) {
    while (firstDate < secondDate) {
      firstDate.setDate(firstDate.getDate() + 1)
      dates.push(firstDate.getTime())
    }
    return dates
  }

  if (period === ms('1h') / 1000) {
    while (firstDate < secondDate) {
      firstDate.setHours(firstDate.getHours() + 1)
      dates.push(firstDate.getTime())
    }
    return dates
  }

  return []
}

const formatResponseData = (responseData, { startTime, endTime, period }) => {
  const originRangeTimes = generateRangeTimes(startTime, endTime, Number(period))

  const datapoints = originRangeTimes.map((time) => ({
    timestamp: time,
    value: 0
  }))

  const indices = responseData.Datapoints.reduce(
    (indices, datapoint) => ({
      ...indices,
      [ datapoint.Timestamp.getTime() ]: datapoint.Sum
    }),
    {}
  )

  const mergedDatapoints = datapoints.map(
    (datapoint) => ({
      ...datapoint,
      value: indices[ datapoint.timestamp ] || 0
    })
  )

  return {
    name: METRIC_LABEL[ responseData.Label ],
    datapoints: mergedDatapoints
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
  const { startTime, endTime, period } = params
  const responseData = await cloudWatch.getMetricStatistics(
    formatRequestParams(params)
  ).promise()

  return await formatResponseData(responseData, { startTime, endTime, period })
}

export default {
  getMetric
}
