import config from 'infrastructure/config'

const { server: { base } } = config

export default {
  origin: (params) => {
    const {
      infrastructure: { cname },
      project: { identifier },
      origin,
      ext
    } = params

    const path = origin.replace(identifier, '')

    return `https://${ cname }/s${ path }.${ ext }`
  },
  target: (params) => {
    const {
      infrastructure: { cname },
      project: { identifier },
      preset,
      target
    } = params

    const path = target.replace(identifier, '')
    const ext = preset ? '' : `.${ params.ext }`

    return `https://${ cname }/s${ path }${ ext }`
  }
}
