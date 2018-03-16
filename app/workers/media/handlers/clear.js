import parallel from 'async/parallel'
import reflect from 'async/reflect'
import fs from 'fs'
import path from 'path'
import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import Media from 'entities/Media'

export default (data, rpc, done) => {
  console.log('clear...')

  const media = Media.from(data.media)

  parallel(
    media.state.tmp.map(f => reflect(done => {
      console.log(`clear ${f}`)
      fs.unlink(path.join(config.tmpDir, f), done)
    })),
    error => {
      console.log('clear done')

      done({ succeed: true, media })
    }
  )
}
