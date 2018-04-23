import sh from 'shorthash'

export default async (req, res, next) => {
  const { query } = req
  const url = query.url || query.src

  if (!url) {
    return res.sendStatus(400)
  }

  req._params = {
    ...req._params,
    url: url,
    urlHash: sh.unique(url)
  }

  next()
}
