import parallel from 'async/parallel'
import fs from 'fs'
import path from 'path'
import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import Media from 'entities/Media'

export default (data, rpc, done) => {
  console.log('clear...')

  const media = Media.from(data.media)
  const { source, target } = media.state

  parallel(
    [
      done => source ?
        fs.unlink(path.join(config.tmpDir, source), done) :
        done(),
      done => target ?
        fs.unlink(path.join(config.tmpDir, target), done) :
        done()
    ],
    error => {
      console.log('clear done')

      if (error) {
        done({ succeed: false, reason: serializeError(error) })
      } else {
        done({ succeed: true })
      }
    }
  )
}
