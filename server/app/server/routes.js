const media = require('./controllers/media');
const params = require('./controllers/params');
const test = require('./controllers/test');

function init(app) {
  app.get(
    '/p/:tenant/media',
    params('tenant', 'preset', 'width', 'url'),
    media.generate
  );

  app.get('/test/html', test.html);
};

module.exports = init;
