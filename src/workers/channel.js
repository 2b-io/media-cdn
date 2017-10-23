const bluebird = require('bluebird');
const gm = require('gm');
const rpc = require('one-doing-the-rest-waiting');

const storage = require('../services/storage');
const Media = require('../entities/Media');

function init(done) {
  const config = require('../services/config');
  const consumer = rpc.createConsumer({
    prefix: config.queuePrefix,
    redis: config.redis
  });
  const producer = rpc.createProducer({
    prefix: config.queuePrefix,
    redis: config.redis
  });

  let channel;

  consumer.register(input => {
    input.onRequest((message, done) => {
      let media = Media.create(message.data.media);

      switch (message.type) {
        case 'prepare-media':
          return channel
            .request('download-origin', {
              media: media.toJSON()
            })
            .waitFor(media.originalPath)
            .onResponse(response => {
              if (!response.data) {
                return done({
                  succeed: false
                });
              }

              channel
                .request('optimize-media', {
                  media: media.toJSON()
                })
                .waitFor(media.uniquePath)
                .onResponse(response => {
                  media.disposeOriginal();

                  if (!response.data) {
                    return done({
                      succeed: false
                    });
                  }

                  done({
                    succeed: true
                  });
                })
                .send();
            })
            .send();

        case 'download-origin':
          return storage
            .meta(media, true)
            .then(media => {
              let exists = !!media.meta;

              if (!exists) {
                return media
                  .fetch(true)
                  .then(media => storage.set(media, true));
              }

              console.log('download from s3');

              return storage
                .get(media, true)
                .then(media => media.save());
            })
            .then(() => done(true))
            .catch(() => done(false));

        case 'optimize-media':
          return new bluebird((resolve, reject) => {
            let originalPath = media.createLocalPath(true);
            let optimizePath = media.createLocalPath(false);

            gm(originalPath)
              .resize(media.width)
              .strip()
              .interlace('Line')
              .write(optimizePath, err => {
                if (err) {
                  return reject(err);
                }

                resolve(storage.set(media));
              });
          })
          .then(() => done(true))
          .catch(() => done(false))
          .finally(() => {
            media.disposeOptimize();
          });
      }
    });
  });

  producer.discover(output => {
    channel = output;

    done();
  });
}

module.exports = init;
