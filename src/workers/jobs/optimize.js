import fs from 'fs-extra'
import cache from 'services/cache'
import optimizer from 'services/optimizer'
export default async (payload) => {
  let origin, target, fileUpload

  try {
    origin = await cache.get(payload.origin)

    target = await optimizer.optimize(origin, payload.args, payload.parameters)

    const sizeOrigin = fs.statSync(origin.path)[ "size" ]
    const sizeTarget = fs.statSync(target.path)[ "size" ]

    if (sizeTarget > sizeOrigin) {
      console.log('SIZE_TARGET > SIZE_ORIGIN')

      fileUpload = await cache.put(payload.target, origin, {
        expires: payload.expires
      })

      console.log('UPLOAD_ORIGIN -> TARGET')

      return {
        ...origin,
        meta: fileUpload
      }
    } else {
      fileUpload = await cache.put(payload.target, target, {
        expires: payload.expires
      })

      return {
        ...target,
        meta: fileUpload
      }
    }
  } finally {
    if (origin) {
      await fs.remove(origin.path)
    }

    if (target) {
      await fs.remove(target.path)
    }
  }
}
