import cloudWatch from 'infrastructure/cloud-watch'

const METRICNAME = {
  BYTES_DOWNLOADED: 'BytesDownloaded',
  REQUESTS: 'Requests'
}

const cloudWatchParams = ({
  name,
  endTime,
  startTime,
  period,
  distributionIdentifier
}) => ({
  Namespace: 'AWS/CloudFront',
  MetricName: METRICNAME[ name ],
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
  Statistics: [
    'Sum',
  ],
})

const metric = async (params) => {
  return await cloudWatch.getMetricStatistics(cloudWatchParams(params)).promise()
}

export default {
  metric
}
