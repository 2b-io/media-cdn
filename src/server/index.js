const express = require('express');
const nocache = require('nocache');
const rpc = require('one-doing-the-rest-waiting');

init(app => {
  let port = app.get('config').serverPort;
  app.listen(port, () => console.log(`Server started at ${port}`));
});

function init(done) {
  const config = require('../services/config');

  console.log(config);

  const app = express();
  app.set('config', config);

  // after all initializations
  const producer = rpc.createProducer({
    prefix: config.queuePrefix,
    redis: config.redis
  });

  producer.discover(channel => {
    app.set('rpc', channel);

    require('./routes')(app);

    done(app);
  });
}
