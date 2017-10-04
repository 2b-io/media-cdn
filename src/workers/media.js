const bluebird = require('bluebird');
const shortHash = require('short-hash');
const kue = require('kue');
const Redis = require('ioredis');
const uuid = require('uuid');

const storage = require('../services/storage');
const Media = require('../entities/Media');

const queue = kue.createQueue();
const redis = new Redis();

kue.app.listen(3001);

function init(done) {
  // listen RPC
  queue.process('rpc', (job, done) => {
    registerTask(job, () => done());
  });

  // register other processes here

  done();
}

function reply(cid, reply) {
  return new bluebird((resolve, reject) => {
    queue
      .create('rpc:reply', {
        cid,
        reply
      })
      .ttl(1000)
      .events(false)
      .removeOnComplete(true)
      .save(() => {
        resolve();
      });
  });
}

function replyAll(hash) {
  return redis
    .lrange(`w:${hash}`, 0, -1)
    .then(jobs => {
      let waits = jobs.map(
        id => reply(id, {
          salt: uuid.v4()
        })
      );

      return bluebird.all(waits);
    })
    .then(() => {
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
