const express = require('express');
const nocache = require('nocache');

init(app => {
  let port = 3000;
  app.listen(port, () => console.log(`Server started at ${port}`));
});

function init(done) {
  const app = express();

  app.use(nocache());

  require('./routes')(app);

  // after all initializations
  done(app);
}


