export default {
  origin: (params) => {
    const { origin, ext } = params

    return ext ? `${origin}.${ext}` : origin
  },
  target: (params) => {
    const {
      origin, ext,
      args: { mode, width, height },
      preset: { hash }
    } = params

    return ext ?
      `${origin}/${hash}/${mode}_${width}x${height}.${ext}` :
      `${origin}/${hash}/${mode}_${width}x${height}`
  }
}
