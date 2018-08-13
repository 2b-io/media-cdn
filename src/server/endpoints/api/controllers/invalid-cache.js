import serializeError from 'serialize-error'

import cache from 'services/cache'

export default async (req, res) => {
  try {
    await cache.invalid(req.body.patterns)
    res.status(201).json({
      succeed: true
    })
  } catch (e) {
    res.status(500).json(
      serializeError(e)
    )
  }
}
