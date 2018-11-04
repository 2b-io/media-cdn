import cloudWatch from 'services/cloud-watch'

const metric = async (req, res, next) => {
  try {
    const { distributionIdentifier, name } = req.params
    const { startTime, endTime, period } = req.query

    const metricData = await cloudWatch.getMetric({
      distributionIdentifier,
      name,
      period,
      startTime,
      endTime
    })

    res.status(200).json(metricData)
  } catch (e) {
    next({
      statusCode: 500,
      reason: e
    })
  }
}

export default {
  metric
}
