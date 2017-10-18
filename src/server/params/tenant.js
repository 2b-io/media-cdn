module.exports = (req, res, next) => {
  console.log('in params/tenant');

  let { tenant } = req.params;

  req._params.tenant = tenant;

  next();
};
