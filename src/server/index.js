const express = require('express');
const app = express();
const port = 3000;

const rpc = require('../services/rpc');

app.get('/', (req, res, next) => {
  const src = 'https://assets.stuffs.cool/2017/10/the.cool.stuffs_2fa5bfc0-bc7e-4ddc-aeca-776f06d05b18.jpg';

  rpc({
    demand: src
  }, (done, reply) => {
    res.json(reply);

    done();
  });
});

app.listen(port, () => console.log(`Server started at ${port}`));
