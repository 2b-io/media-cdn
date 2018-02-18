import dl from 'download'
import fs from 'fs'
import gm from 'gm'
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
            media: message.data.media
          })
          .waitFor(media.props.localOriginal)
          .onResponse(response => {
            console.log('download-original done')

            output
              .request('optimize-original', {
                media: message.data.media,
                options: message.data.options
              })
              .waitFor(media.props.localTarget)
              .onResponse(response => {
                console.log('optimize-original done')

                done(response)
              })
              .send()

          })
          .send()

      case 'download-original':
        console.log('download-original')

        return s3
          .meta(media.props.remoteOriginal)
          .catch(() => null)
          .then(meta => {
            if (!meta) {
              console.log('downloading from src...')

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
                console.log('download from src done, uploading to s3...')
                return s3.store(
                  media.props.localOriginal,
                  media.props.remoteOriginal
                )
              })
              .then(() => {
                console.log('upload to s3 done')
              })
            }

            console.log('downloading from s3...')

            return new Promise((resolve, reject) => {
              const dir = path.dirname(media.props.localOriginal)

              mkdirp.sync(dir)

              s3
                .receive(media.props.remoteOriginal)
                .pipe(fs.createWriteStream(media.props.localOriginal))
                .on('finish', () => {
                  resolve()
                })
            })
            .then(() => {
              console.log('download from s3 done')
            })
          })
          .finally(done)

      case 'optimize-original':
        const options = message.data.options

        return new Promise((resolve, reject) => {
          const dir = path.dirname(media.props.localTarget)

          mkdirp.sync(dir)

          gm(media.props.localOriginal)
            .resize(media.props.width)
            .strip()
            .interlace('Line')
            .quality(options.quality)
            .write(media.props.localTarget, error => {
              if (error) {
                return reject(error)
              }

              resolve()
            })
        })
        .then(() => {
          return s3.store(
            media.props.localTarget,
            media.props.remoteTarget
          )
        })
        .finally(() => done())
    }

    done({
      succeed: false
    })
  })
})
