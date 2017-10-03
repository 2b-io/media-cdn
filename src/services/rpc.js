const kue = require('kue');
const uuid = require('uuid');

const queue = kue.createQueue();
const callbacks = {};

queue.process('rpc:reply', (job, done) => {
  let { data } = job;
  let { cid, reply } = data;

  console.log('on server:', cid, data);

  let cb = callbacks[cid];

  if (typeof cb === 'function') {
    return cb(done, reply);
  }

  done();
});

module.exports = function(data, cb) {
  let job = queue
    .create('rpc', data)
    .events(false)
    .removeOnComplete(true)
    .save(err => {
      console.log('queue', job.id);

      callbacks[job.id] = cb;
    });
};
