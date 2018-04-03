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
    .request()
    .content({
      type: job,
      data: { media }
    })
    .sendTo('worker')
    .ttl(5e3)
    .waitFor(waitFor(media, job))
    .onReply(async (error, content) => {
      const succeed = !error && content && content.succeed

      console.log(`[JOB] ${job} done: ${succeed}`)

      done(null, content)
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

export default async (data, rpc) => {
  return new Promise((resolve, reject) => {
    waterfall(
      [
        (done) => done(null, { media: data.media }),
        ...data.flow.map(job => handle(job, rpc)),
      ],
      (error, data) => {
        if (error) {
          return reject(error)
        }

        resolve({ succeed: true, media: data.media })
      }
    )
  })
}
