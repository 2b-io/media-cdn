export default [
  function getUIDArg(req, res, next) {
    const { slug, sh } = req.params

    req._args = {
      ...req._args,
      uid: `${slug}/${sh}`,
      crawlable: false
    }

    next()
  },
  function getSourceArg(req, res, next) {
    const { ext } = req.params
    const { uid } = req._args
    const source = `${uid}/source.${ext}`

    req._args = {
      ...req._args,
      source,
      src: {
        pathname: source,
        toString: () => source
      }
    }

    next()
  },
  function getTargetArg(req, res, next) {
    const { p, pv, m, w, h, ext } = req.params
    const { uid } = req._args

    if (!p) {
      req._args = {
        ...req._args,
        requestOrigin: true
      }

      return next()
    }

    req._args = {
      ...req._args,
      target: `${uid}/${p}/${pv}/${m}_${w}x${h}.${ext}`
    }

    next()
  }
]
