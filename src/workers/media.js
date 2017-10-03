const kue = require('kue');
const queue = kue.createQueue();

console.log('Worker [media] started...');

queue.process('rpc', (job, done) => {
  let { data } = job;
  let cid = job.id;

  console.log('on worker', cid, data);

  setTimeout(() => reply(cid, data), 5000);

  done();
});

function reply(cid, data) {
  queue
    .create('rpc:reply', {
      cid: cid,
      reply: data
    })
    .events(false)
    .removeOnComplete(true)
    .save();
}
