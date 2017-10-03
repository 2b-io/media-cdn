const shortHash = require('short-hash');
const kue = require('kue');
const Redis = require('ioredis');
const uuid = require('uuid');

const queue = kue.createQueue();
const redis = new Redis();

kue.app.listen(3001);

function init(cb) {
  // listen RPC
  queue.process('rpc', (job, done) => {
    registerTask(job, () => {
      done();
    });
  });

  cb();
}

function reply(cid, reply) {
  queue
    .create('rpc:reply', {
      cid,
      reply
    })
    .ttl(1000)
    .events(false)
    .removeOnComplete(true)
    .save();
}

function replyAll(hash) {
  redis
    .lrange(`w:${hash}`, 0, -1)
    .then(arr => {
      console.log(arr);

      for (let i = 0; i < arr.length; i++) {
        let id = arr[i];
        console.log(id);

        reply(id, {
          salt: uuid.v4()
        });
      }

      return redis.del(`w:${hash}`);
    });
}

function beginProcess(hash) {
  setTimeout(() => replyAll(hash), 5000);
}

function registerTask(job, done) {
  console.log('registerTask...', job.id);
  const hash = shortHash(job.data.demand);

  redis
    .llen(`w:${hash}`)
    .then(length => {
      console.log(`w:${hash}`, length);

      if (length === 0) {
        beginProcess(hash);
      }

      return redis.lpush(`w:${hash}`, job.id);
    })
    .finally(() => done());
}

init(() => console.log('Worker [media] started...'));
