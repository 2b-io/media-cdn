import parallel from 'async/parallel'
import series from 'async/series'
import fs from 'fs'
import path from 'path'

import config from 'infrastructure/config'
import Media from 'entities/Media'

const handle = (job, media, rpc) => done => {
  rpc
    .request(job, { media })
    .waitFor(waitFor(job))
    .onResponse(message => {
      const succeed = message && message.data && message.data.succeed

      if (succeed) {
        done(null, message.data)
      } else {
        done(message.data)
      }
    })
    .send()
}

const waitFor = (media, job) => {
  switch (job) {
    case 'download':
      return media.state.source

    case 'optimize':
      return media.state.target
  }
}

export default (data, rpc, done) => {
  const media = Media.from(data.media)
  const { source, target } = media.state

  series(
    data.flow.map(job => handle(job, media, rpc)),
    (error) => {
      if (error) {
        done({ succeed: false, reason: error.toString() })
      } else {
        done({ succeed: true })
      }

      console.log('clear tmp files...')

      parallel(
        [
          done => source ?
            fs.unlink(path.join(config.tmpDir, source), done) :
            done(),
          done => target ?
            fs.unlink(path.join(config.tmpDir, target), done) :
            done()
        ],
        () => console.log('clear tmp files done')
      )
    }
  )
}
