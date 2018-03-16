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
  console.log('cache-target...')

  const media = Media.from(data.media)

  const { source, target, useSourceAsTarget } = media.state

  putToCache(target, useSourceAsTarget ? source : target)
    .then(() => done({ succeed: true, media}))
    .catch(error => done({
      succeed: false,
      error: serializeError(error)
    }))
    .finally(() => console.log('cache-target done'))
}
