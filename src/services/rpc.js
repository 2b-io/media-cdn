const kue = require('kue');
const uuid = require('uuid');

const queue = kue.createQueue();
const callbacks = {};

queue.process('rpc:reply', 1000, (job, done) => {
  let { data } = job;
  let { cid, reply } = data;

  let cb = callbacks[cid];

  if (typeof cb === 'function') {
    setTimeout(() => cb(reply));
  }

  done();
});

module.exports = function(data, cb) {
  let job = queue
    .create('rpc', data)
    .events(false)
    .removeOnComplete(true)
    .save(err => {
      callbacks[job.id] = cb;
    });
};
