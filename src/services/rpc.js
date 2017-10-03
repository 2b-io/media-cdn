const kue = require('kue');
const uuid = require('uuid');

const queue = kue.createQueue();
const callbacks = {};

queue.process('rpc:reply', (job, done) => {
  let { data } = job;
  let { cid, reply } = data;

  let cb = callbacks[cid];
  delete callbacks[cid]; // -> should change to immutable or set undefined for better performance

  if (typeof cb === 'function') {
    process.nextTick(() => cb(reply));
  }

  done();
});

module.exports = function(data, cb) {
  // todo handle errors and timeout

  let job = queue
    .create('rpc', data)
    .events(false)
    .removeOnComplete(true)
    .save(err => {
      callbacks[job.id] = cb;
    });
};
