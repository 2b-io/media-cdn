const bluebird = require('bluebird');
const kue = require('kue');
const uuid = require('uuid');

const queue = kue.createQueue();

function init(done) {
  queue.process('create-channel', (job, done) => {
    let channel = createChannel();

    done(null, channel);
  });

  done();
}

function createChannel() {
  let channelName = uuid.v4();

  queue.process(`channel:${channelName}:inbox`, (job, done) => {
    console.log(`Channel [${channelName}] received message ${job.id}`);

    done();

    setTimeout(() => {
      reply(channelName, 'hahaha');
    }, 1000);
  });

  return channelName;
}

function reply(channel, response) {
  queue
    .create(`channel:${channel}:outbox`, response)
    .removeOnComplete(true)
    .save(() => console.log(`Send message to ${channel}`));
}

module.exports = init;
