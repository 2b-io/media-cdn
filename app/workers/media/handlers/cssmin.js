import CleanCSS from 'clean-css'
import fs from 'fs'
import mkdirp from 'mkdirp'
import path from 'path'
import { Transform } from 'stream'

import config from 'infrastructure/config'
import s3 from 'infrastructure/s3'
import Media from 'entities/Media'

const putToCache = async (file) => {
  const local = path.join(config.tmpDir, file)
  const remote = `media/${file}`

  await s3.store(local, remote)
}

const createMinifyTransform = minifier => {
    return new Transform({
        transform(chunk, encoding, callback) {
            const output = minifier.minify(chunk.toString());
            this.push(output.styles);
            callback();
        }
    });
}

const minify = async (media) => {
  return new Promise((resolve, reject) => {
    const minifier = new CleanCSS()

    const { source, target } = media.state

    const input = path.join(config.tmpDir, source)
    const output = path.join(config.tmpDir, target)
    const outputDir = path.dirname(output)

    mkdirp.sync(outputDir)

    fs.createReadStream(input)
      .on('error', reject)
      .pipe(createMinifyTransform(minifier))
      .pipe(fs.createWriteStream(output))
      .on('finish', () => resolve())
  })
}

const cssmin = async (media) => {
  await minify(media)

  await putToCache(media.state.target)
}

export default (data, rpc, done) => {
  console.log('cssmin...')

  const media = Media.from(data.media)

  cssmin(media)
    .then(() => done({ succeed: true }))
    .catch(error => done({ succeed: false, reason: error.toString() }))
    .finally(() => console.log('cssmin done'))
}
