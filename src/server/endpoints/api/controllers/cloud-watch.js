import cloudWatch from 'services/cloud-watch'

const getMetricDownload = async (req, res, next) => {
  try {
    const {
      params
    } = req.params

    const metricData = await cloudWatch.getMetricDownload(params)

    res.status(200).json(metricData)
  } catch (e) {
    next({
      statusCode: 500,
      reason: e
    })
  }
}

const getMetricUpload = async (req, res, next) => {
  try {
    const {
      params
    } = req.params

    const metricData = await cloudWatch.getMetricUpload(params)

    res.status(200).json(metricData)
  } catch (e) {
    next({
      statusCode: 500,
      reason: e
    })
  }
}
export default {
  getMetricDownload,
  getMetricUpload
}
