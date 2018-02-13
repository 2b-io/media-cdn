module.exports = (req, res, next) => {
  let { preset = 'default' } = req.query;

  req._params.preset = {
    id: preset,
    step: 8
  };

  next();
};
