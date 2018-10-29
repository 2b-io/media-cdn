import cloudWatch from 'infrastructure/cloud-watch'

const getMetricDownload = async (params) => {
  const cloudWatchParams = {
    Namespace: 'AWS/CloudFront',
    MetricName: 'BytesUploaded',
    Statistics: [
      'Sum',
    ],
    ...params
  }
  return await cloudWatch.getMetricStatistics(params).promise()
}

const getMetricUpload = async (params) => {
  const cloudWatchParams = {
    Namespace: 'AWS/CloudFront',
    MetricName: 'BytesUploaded',
    Statistics: [
      'Sum',
    ],
    ...params
  }
  return await cloudWatch.getMetricStatistics(params).promise()
}
export default {
  getMetricDownload
  getMetricUpload
}
