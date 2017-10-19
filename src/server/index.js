const express = require('express');
const nocache = require('nocache');
const rpc = require('one-doing-the-rest-waiting');

init(app => {
  let port = 3000;
  app.listen(port, () => console.log(`Server started at ${port}`));
});

function init(done) {
  const app = express();

  // app.use(nocache());

  require('./routes')(app);

  // after all initializations
  const producer = rpc.createProducer();

  producer.discovery(channel => {
    app.set('rpc', channel);

    done(app);
  });
}


