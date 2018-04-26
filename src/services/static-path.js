import config from 'infrastructure/config'

const { server: { base } } = config

export default {
  origin: (params) => {
    const { origin, ext } = params

    return ext ?
      `${base}/s/${origin}.${ext}` :
      `${base}/s/${origin}`
  },
  target: (params) => {
    const {
      origin, ext,
      args: {
        mode,
        width = 'auto',
        height = 'auto'
      },
      preset: {
        hash
      }
    } = params

    return ext ?
      `${base}/s/${origin}/${hash}/${mode}_${width}x${height}.${ext}` :
      `${base}/s/${origin}/${hash}/${mode}_${width}x${height}`
  }
}
