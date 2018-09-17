import fs from 'fs-extra'
import cache from 'services/cache'
import optimizer from 'services/optimizer'

export default async (payload) => {
  let origin, target

  try {
    origin = await cache.get(payload.origin, payload.meta ? payload.meta.ETag : undefined)

    target = await optimizer.optimize(origin, payload.args)

    const upload = await cache.put(payload.target, target)

    return {
      ...target,
      meta: upload
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
