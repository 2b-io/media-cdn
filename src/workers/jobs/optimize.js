import fs from 'fs-extra'
import cache from 'services/cache'
import optimizer from 'services/optimizer'

export default async (payload) => {
  console.log('optimize...')
  console.time('optimize...')

  let origin, target

  try {
    const origin = await cache.get(payload.origin)

    const target = await optimizer.optimize(origin, payload.args)

    await cache.put(payload.target, target)

    return target
  } finally {
    if (origin) {
      await fs.remove(origin.path)
    }

    if (target) {
      await fs.remove(target.path)
    }

    console.timeEnd('optimize...')
  }
}
