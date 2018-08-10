import serializeError from 'serialize-error'

import invalidCache from 'services/invalidCache'

export default async (req, res) => {
  try {
    invalidCache(req.body.patterns)
    res.status(201).json({
      succeed: true
    })
  } catch (e) {
    res.status(400).json(
      serializeError(e)
    )
  }
}
