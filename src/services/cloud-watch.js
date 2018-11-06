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
  let timePoint = startTime
  let dates = []

  if (period === ms('1d') / 1000) {
    while (timePoint < endTime) {
      dates.push(timePoint)
      timePoint += ms('1d')
    }

    return dates
  }

  if (period === ms('1h') / 1000) {
    while (timePoint < endTime) {
      dates.push(timePoint)
      timePoint += ms('1h')
    }

    return dates
  }

  return []
}

const formatResponseData = (responseData, { startTime, endTime, period }) => {
  const originRangeTimes = generateRangeTimes(Number(startTime), Number(endTime), Number(period))

  const indices = responseData.Datapoints.reduce(
    (indices, datapoint) => ({
      ...indices,
      [ datapoint.Timestamp.getTime() ]: datapoint.Sum
    }),
    {}
  )

  const datapoints = originRangeTimes.map((time) => ({
    timestamp: time,
    value: indices[ time ] || 0
  }))

  return {
    name: METRIC_LABEL[ responseData.Label ],
    datapoints
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
