const storage = require('../services/storage');

module.exports = function(app) {
  const config = app.get('config');

  storage.init(config.aws.s3);
};
