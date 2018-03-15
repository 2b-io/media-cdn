import parallel from 'async/parallel'
import waterfall from 'async/waterfall'
import fs from 'fs'
import path from 'path'

import config from 'infrastructure/config'
import Media from 'entities/Media'

const handle = (job, rpc) => ({ media }, done) => {
  rpc
    .request(job, { media })
    .waitFor(waitFor(media, job))
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
      return media.source

    case 'optimize':
      return media.target
  }
}

export default (data, rpc, done) => {
  waterfall(
    [
      (done) => done(null, { media: data.media }),
      ...data.flow.map(job => handle(job, rpc)),
    ],
    (error) => {
      if (error) {
        done({ succeed: false, reason: error.toString() })
      } else {
        done({ succeed: true })
      }
    }
  )
}
