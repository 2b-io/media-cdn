import cloudWatch from 'infrastructure/cloud-watch'

const METRICNAME = {
  BYTES_DOWNLOADED: 'BytesDownloaded',
  BYTES_UPLOADED: 'BytesUploaded',
  BYTES_REQUESTS: 'Requests'
}

const cloudWatchParams = ({
  name,
  endTime,
  startTime,
  period,
  distributionIdentifier
}) => {
  const StartTime = new Date(Number(startTime)).toISOString()
  const EndTime = new Date(Number(endTime)).toISOString()

  return {
    Namespace: 'AWS/CloudFront',
    MetricName: METRICNAME[ name ],
    StartTime,
    EndTime,
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
  }
}

const metric = async (params) => {
  return await cloudWatch.getMetricStatistics(cloudWatchParams(params)).promise()
}

export default {
  metric
}
