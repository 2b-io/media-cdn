import jpeg from './jpeg'
import png from './png'
import webp from './webp'

const scenarios = {
  'image/jpeg': jpeg,
  'image/png': png,
  'image/webp': webp
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
