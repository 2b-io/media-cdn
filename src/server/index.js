const express = require('express');
const app = express();
const port = 3000;

const kue = require('kue');
const queue = kue.createQueue();

app.get('/', (req, res, next) => {
  const job = queue.create('media').save();

  job.on('complete', data => {
    res.json({
      job,
      data
    });
  })
});

app.listen(port, () => console.log(`Server started at ${port}`));
