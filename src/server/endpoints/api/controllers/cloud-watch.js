import cloudWatch from 'services/cloud-watch'

const metricDownload = async (req, res, next) => {
  try {
    const { params } = req.body
    const metricData = await cloudWatch.metricDownload(params)
    res.status(200).json(metricData)
  } catch (e) {
    next({
      statusCode: 500,
      reason: e
    })
  }
}

const metricUpload = async (req, res, next) => {
  try {
    const { params } = req.body
    const metricData = await cloudWatch.metricUpload(params)

    res.status(200).json(metricData)
  } catch (e) {
    next({
      statusCode: 500,
      reason: e
    })
  }
}
export default {
  metricDownload,
  metricUpload
}
