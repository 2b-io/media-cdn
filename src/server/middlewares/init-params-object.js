export default function initParamObject(req, res, next) {
  req._params = {}

  next()
}
