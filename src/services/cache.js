export default {
  head: async (key) => {
    console.log(`cache.js: HEAD /${key}`)

    console.log('cache.js: CACHE MISS')
    return null
  },
  put: async (key, file) => {
    return true
  },
  get: async (key) => {
    return 'localpath'
  }
}
