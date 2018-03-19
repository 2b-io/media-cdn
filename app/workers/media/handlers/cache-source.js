import path from 'path'
import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import s3 from 'infrastructure/s3'
import Media from 'entities/Media'

const putToCache = async (remote, local) => {
  return await s3.store(
    path.join(config.tmpDir, local),
    `media/${remote}`
  )
}

export default (data, rpc, done) => {
  const media = Media.from(data.media)
  const { source } = media.state
  // const { cacheSource, source } = media.state

  // if (!cacheSource) {
  //   return done({ succeed: true, media})
  // }

  putToCache(source, source)
    .then(() => done({ succeed: true, media}))
    .catch(error => done({
      succeed: false,
      error: serializeError(error)
    }))
}
