import cloudWatch from 'services/cloud-watch'

const getMetricStatistics = async (req, res, next) => {
  try {
    const {
      params
    } = req.params

    const metricData = await cloudWatch.getMetricStatistics(params)

    res.status(200).json(metricData)
  } catch (e) {
    next({
      statusCode: 500,
      reason: e
    })
  }
}
export default {
  getMetricStatistics
}
