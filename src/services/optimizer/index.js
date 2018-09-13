import jpeg from './jpeg'
import png from './png'
import webp from './webp'
import svg from './svg'
import gif from './gif'

const scenarios = {
  'image/jpeg': jpeg,
  'image/png': png,
  'image/webp': webp,
  'image/svg+xml': svg,
  'image/gif': gif
}

export default {
  optimize: async (file, args) => {
    const { contentType } = file
    const scenario = scenarios[contentType]

    if (!scenario) {
      return file
    }

    return await scenario(file, args)
  }
}
