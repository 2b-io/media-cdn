import fs from 'fs'
import mkdirp from 'mkdirp'
import path from 'path'
import minifyTransform from 'minify-stream'
import serializeError from 'serialize-error'
import UglifyJS from 'uglify-js'

import config from 'infrastructure/config'
import s3 from 'infrastructure/s3'
import Media from 'entities/Media'

const putToCache = async (file) => {
  const local = path.join(config.tmpDir, file)
  const remote = `media/${file}`

  await s3.store(local, remote)
}

const minify = async (media) => {
  return new Promise((resolve, reject) => {
    const { source, target } = media.state

    const input = path.join(config.tmpDir, source)
    const output = path.join(config.tmpDir, target)
    const outputDir = path.dirname(output)

    mkdirp.sync(outputDir)

    fs.createReadStream(input)
      .on('error', reject)
      .pipe(minifyTransform({
        uglify: UglifyJS
      }))
      .pipe(fs.createWriteStream(output))
      .on('finish', () => resolve())
  })
}

const jsmin = async (media) => {
  await minify(media)

  await putToCache(media.state.target)
}

export default (data, rpc, done) => {
  console.log('jsmin...')

  const media = Media.from(data.media)

  jsmin(media)
    .then(() => done({ succeed: true }))
    .catch(error => done({
      succeed: false,
      reason: serializeError(error)
    }))
    .finally(() => console.log('jsmin done'))
}
