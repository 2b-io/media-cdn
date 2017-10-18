module.exports = (req, res, next) => {
  let { url } = req.query;

  if (!url) {
    return next(new Error('Invaid url param'));
  }

  req._params.url = url;

  next();
};
