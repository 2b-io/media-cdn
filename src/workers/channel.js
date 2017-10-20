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
      console.log(message.type);

      let media = Media.create(message.data.media);

      // console.log(media);

      switch (message.type) {
        case 'prepare-media':
          return channel
            .request('download-origin', {
              media: media.toJSON()
            })
            .waitFor(media.originalPath)
            .onResponse(response => {
              console.log('download-origin done');

              // done(response);

              channel
                .request('optimize-media', {
                  media: media.toJSON()
                })
                .waitFor(media.uniquePath)
                .onResponse(response => {
                  console.log('optimize-media done');

                  media.disposeOriginal();

                  done({
                    succeed: true
                  });
                })
                .call();
            })
            .call();

        case 'download-origin':
          return storage
            .meta(media, true)
            .then(media => {
              let exists = !!media.meta;

              if (!exists) {
                console.log('download from origin');

                return media
                  .fetch(true)
                  .then(media => storage.set(media, true));
              }

              console.log('download from s3');

              return storage
                .get(media, true)
                .then(media => media.save());
            })
            .finally(() => {
              done();
            });

        case 'optimize-media':
          let originalPath = media.createLocalPath(true);
          let optimizePath = media.createLocalPath(false);

          console.log(`optimize-media from ${originalPath} to ${optimizePath}`);

          return gm(originalPath)
            .resize(media.width)
            .strip()
            .interlace('Line')
            .write(optimizePath, err => {
              storage
                .set(media)
                .then(() => done())
                .finally(() => {
                  media.disposeOptimize();
                });
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
