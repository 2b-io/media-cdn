import parallel from 'async/parallel'
import reflect from 'async/reflect'
import fs from 'fs'
import path from 'path'
import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import Media from 'entities/Media'

export default (data, rpc, done) => {
  const media = Media.from(data.media)

  parallel(
    media.state.tmp.map(
      f => reflect(
        done => fs.unlink(path.join(config.tmpDir, f), done)
      )
    ),
    error => done({ succeed: true, media })
  )
}
