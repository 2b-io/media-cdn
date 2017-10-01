const kue = require('kue');
const queue = kue.createQueue();

console.log('Worker [media] started...');

queue.process('media', function(job, done) {
  console.log(job);

  setTimeout(done, 500);
});
