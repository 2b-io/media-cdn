const express = require('express');
const nocache = require('nocache');
const uuid = require('uuid');

const app = express();
const port = 3000;

const rpc = require('../services/rpc');

app.use(nocache());

app.get('/', (req, res, next) => {
  let id = uuid.v4();
  console.log('handle request...', id);

  const src = 'https://assets.stuffs.cool/2017/10/the.cool.stuffs_2fa5bfc0-bc7e-4ddc-aeca-776f06d05b18.jpg';

  rpc({
    demand: src
  }, (reply) => {
    res.json(reply);
  });
});

app.listen(port, () => console.log(`Server started at ${port}`));
