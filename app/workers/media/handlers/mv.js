import mv from 'mv'
import path from 'path'
import serializeError from 'serialize-error'

import Media from 'entities/Media'
import config from 'infrastructure/config'

export default (data, rpc, done) => {
  const media = Media.from(data.media)
  const src = media.state.url
  const dest = path.join(config.tmpDir, media.state.source)

  mv(src, dest, { mkdirp: true }, error => {
    if (error) {
      return done({
        succeed: false,
        reason: serializeError(error)
      })
    }

    media.addTemporaryFile(media.state.source)

    done({ succeed: true, media })
  })
}
