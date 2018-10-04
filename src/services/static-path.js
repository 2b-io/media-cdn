import config from 'infrastructure/config'

const { server: { base } } = config

export default {
  origin: (params) => {
    const { origin, ext } = params

    return `${ base }/s/${ origin }.${ ext }`

  },
  target: (params) => {
    const {
      origin, ext,
      args: {
        mode,
        width = 'auto',
        height = 'auto'
      }
    } = params

    return `${ base }/s/${ origin }/${ mode }_${ width }x${ height }.${ ext }`
  }
}
