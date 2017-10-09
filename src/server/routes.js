const media = require('./controllers/media');
const test = require('./controllers/test');

function init(app) {
  app.get('/p/:tenant/media', media.generate);

  app.get('/test/html', test.html);
  app.get('/test/worker', test.worker);
};

module.exports = init;
