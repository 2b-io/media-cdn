import flatten from 'array-flatten'

export default (...middlewareDefs) => flatten(middlewareDefs).map(
  middleware => async (req, res, next) => {
    try {
      await middleware(req, res, next)
    } catch (error) {
      next({
        statusCode: 500,
        reason: error
      })
    }
  }
)
