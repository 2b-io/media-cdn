import cloudWatch from 'infrastructure/cloud-watch'

const getMetricStatistics = async (params) => {
  return await cloudWatch.getMetricStatistics(params).promise()
}
export default {
  getMetricStatistics
}
