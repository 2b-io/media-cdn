import dl from 'download'
import fs from 'fs'
import mkdirp from 'mkdirp'
import path from 'path'
import rpc from 'one-doing-the-rest-waiting'

import config from 'infrastructure/config'
import s3 from 'infrastructure/s3'
import Media from 'entities/Media'

const { queuePrefix, redis } = config

Promise.all([
  new Promise(resolve => {
    rpc.createConsumer({
      prefix: queuePrefix,
      redis: redis
    }).register(resolve)
  }),
  new Promise(resolve => {
    rpc.createProducer({
      prefix: queuePrefix,
      redis: redis
    }).discover(resolve)
  })
]).then(([ input, output ]) => {
  console.log('worker [media] done')

  input.onRequest((message, done) => {
    const media = Media.from(message.data.media)

    switch (message.type) {
      case 'process-media':
        console.log('process-media')

        return output
          .request('download-original', {
            media: media.toJSON()
          })
          .waitFor(media.props.localOriginal)
          .onResponse(response => {
            done({ succeed: true, response, media })
          })
          .send()

      case 'download-original':
        console.log('download-original')

        return s3
          .meta(media.props.remoteOriginal)
          .catch(() => null)
          .then(meta => {
            if (!meta) {
              console.log('download from src')

              return new Promise((resolve, reject) => {
                const dir = path.dirname(media.props.localOriginal)

                mkdirp.sync(dir)

                dl(media.props.src)
                  .pipe(fs.createWriteStream(media.props.localOriginal))
                  .on('finish', () => {
                    resolve()
                  })
                  .on('error', error => {
                    reject(error)
                  })
              })
              .then(() => {
                console.log('download done')
              })
            }
          })
          .finally(done)
    }

    done({
      succeed: false
    })
  })
})
