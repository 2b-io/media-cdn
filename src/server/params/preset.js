module.exports = (req, res, next) => {
  console.log('in params/preset');

  let { preset = 'default' } = req.query;

  req._params.preset = {
    id: preset,
    step: 10
  };

  next();
};
