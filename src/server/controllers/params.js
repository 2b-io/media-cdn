function handlerNotFound(e) {
  return function(req, res, next) {
    next(e);
  };
}

function init(req, res, next) {
  req._params = {};

  next();
}

function getParamHandler(param) {
  try {
    const handler = require(`../params/${param}`);

    if (!handler) {
      throw new Error(`Handler for param ${param} is not found`);
    }

    return handler;
  } catch(e) {
    return handlerNotFound(e);
  }
}

module.exports = (...params) => {
  return [ init ].concat(params.map(getParamHandler));
};
