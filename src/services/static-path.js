export default {
  origin: (params) => {
    const { origin, ext } = params

    return ext ? `${origin}.${ext}` : origin
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
      `/s/${origin}/${hash}/${mode}_${width}x${height}.${ext}` :
      `/s/${origin}/${hash}/${mode}_${width}x${height}`
  }
}
