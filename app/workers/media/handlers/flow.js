import parallel from 'async/parallel'
import waterfall from 'async/waterfall'
import fs from 'fs'
import path from 'path'
import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import Media from 'entities/Media'

const handle = (job, rpc) => ({ media }, done) => {
  console.log(`[JOB] ${job}...`)

  rpc
    .request(job, { media })
    .waitFor(waitFor(media, job))
    .onResponse(message => {
      const succeed = message && message.data && message.data.succeed

      console.log(`[JOB] ${job} done: ${succeed}`)

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
    case 'crawl':
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
    (error, data) => {
      if (error) {
        done({ succeed: false, reason: serializeError(error) })
      } else {
        done({ succeed: true, media: data.media })
      }
    }
  )
}
