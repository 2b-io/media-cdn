import cloudWatch from 'services/cloud-watch'

const formatMediaData = async (responseData) => {
  return await {
    name: responseData.Label,
    datapoints: responseData.Datapoints.map(({
      Timestamp,
      Sum
    }) => (
      {
        value: Sum,
        timestamp: Date.parse(Timestamp)
      }
    ))
  }
}

const metric = async (req, res, next) => {
  try {
    const { distributionIdentifier, name } = req.params
    const { startTime, endTime, period } = req.query

    const responseData = await cloudWatch.metric({
      distributionIdentifier,
      name,
      period,
      startTime,
      endTime
    })

    const metricData = await formatMediaData(responseData)

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
