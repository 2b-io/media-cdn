import fs from 'fs'
import mkdirp from 'mkdirp'
import path from 'path'
import serializeError from 'serialize-error'
import sharp from 'sharp'

import config from 'infrastructure/config'
import s3 from 'infrastructure/s3'
import Media from 'entities/Media'

const getStat = async (file) => {
  return new Promise((resolve, reject) => {
    fs.stat(
      path.join(config.tmpDir, file),
      (error, stat) => {
        if (error) {
          return reject(error)
        }

        resolve(stat)
      }
    )
  })
}

const putToCache = async (target, source) => {
  return await s3.store(
    path.join(config.tmpDir, source || target),
    `media/${target}`
  )
}

const optimize = async (media) => {
  const { source, target } = media.state

  const input = path.join(config.tmpDir, source)
  const output = path.join(config.tmpDir, target)
  const outputDir = path.dirname(output)

  mkdirp.sync(outputDir)

  let image = sharp(input)

  const { quality } = media.state

  const meta = await image.metadata()

  if (meta.format === 'jpeg') {
    image = image.jpeg({
      quality: quality,
      progressive: true,
      force: false
    })
  } else if (meta.format === 'png') {
    image = image.png({
      compressionLevel: Math.ceil(quality / 100 * 9),
      progressive: true,
      force: false
    })
  }

  // resize logic
  const { mode, height, width } = media.state

  const resize = !(width === 'auto' && height === 'auto')

  if (resize) {
    image = image.resize(
      width === 'auto' ? null : width,
      height === 'auto' ? null: height
    )

    if (mode === 'cover') {
      image = image.min()
    }

    if (mode === 'contain') {
      image = image.max()
    }

    if (mode === 'crop') {
      image = image.crop()
    }
  }

  const targetMeta = await image.toFile(output)

  media.addTemporaryFile(media.state.target)

  if (!resize) {
    // compare file sizes
    const state = await getStat(media.state.source)

    if (state.size < targetMeta.size) {
      // source is better, cache source
      media.state.useSourceAsTarget = true
    }
  }

  return media
}

export default (data, rpc, done) => {
  console.log('optimize...')

  const media = Media.from(data.media)

  optimize(media)
    .then(media => done({ succeed: true, media }))
    .catch(error => done({
      succeed: false,
      reason: serializeError(error)
    }))
    .finally(() => console.log('optimize done'))
}
