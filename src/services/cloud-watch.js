import cloudWatch from 'infrastructure/cloud-watch'

const metricDownload = async (params) => {
  const cloudWatchParams = {
    Namespace: 'AWS/CloudFront',
    MetricName: 'BytesDownloaded',
    Statistics: [
      'Sum',
    ],
    ...params
  }

  return await cloudWatch.getMetricStatistics(cloudWatchParams).promise()
}

const metricUpload = async (params) => {
  const cloudWatchParams = {
    Namespace: 'AWS/CloudFront',
    MetricName: 'BytesUploaded',
    Statistics: [
      'Sum',
    ],
    ...params
  }

  return await cloudWatch.getMetricStatistics(cloudWatchParams).promise()
}
export default {
  metricDownload,
  metricUpload
}
