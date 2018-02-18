module.exports = (req, res, next) => {
  let { tenant } = req.params;

  req._params.tenant = tenant;

  next();
};
