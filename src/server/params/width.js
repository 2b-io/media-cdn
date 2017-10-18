function optimizeWidth(width, step) {
  return Math.ceil(width / step) * step;
}

module.exports = (req, res, next) => {
  let { width = 'auto' } = req.query;
  let { preset } = req._params;

  if (width === 'auto') {
    req._params.width = width;

    return next();
  }

  req._params.width = optimizeWidth(width, preset.step);

  console.log(req._params.width);

  next();
};
