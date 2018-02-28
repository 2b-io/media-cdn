import mkdirp from 'mkdirp'
import path from 'path'
import sharp from 'sharp'

import config from 'infrastructure/config'
import s3 from 'infrastructure/s3'
import Media from 'entities/Media'

const putToCache = async (file) => {
  const local = path.join(config.tmpDir, file)
  const remote = `media/${file}`

  await s3.store(local, remote)
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
  }

  // resize logic
  const { mode, height, width } = media.state

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

  await image.toFile(output)

  await putToCache(media.state.target)
}

export default (data, rpc, done) => {
  console.log('optimize...')

  const media = Media.from(data.media)

  optimize(media)
    .then(() => done({ succeed: true }))
    .catch(error => done({ succeed: false, reason: error.toString() }))
    .finally(() => console.log('optimize done'))
}
