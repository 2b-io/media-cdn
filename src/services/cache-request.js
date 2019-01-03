import ms from 'ms'

const CACHE = {}

export default {
  create(type) {
    if (!CACHE[ type ]) {
      CACHE[ type ] = {}
    }

    const cache = CACHE[ type ]

    return {
      async get(index, cacheDuration, getValueFn) {
        const needCache = !cache[ index ] || cache[ index ].cacheTime + ms(cacheDuration) < Date.now()

        if (needCache) {
          const cachedValue = await getValueFn()

          cache[ index ] = {
            value: cachedValue,
            cacheTime: Date.now()
          }
        }

        return cache[ index ].value
      }
    }
  }
}
