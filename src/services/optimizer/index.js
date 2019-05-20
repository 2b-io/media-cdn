import mimeAliases from 'services/mime-aliases'

import jpeg from './jpeg'
import png from './png'
// import webp from './webp'
import svg from './svg'
import gif from './gif'

const scenarios = {
  'image/jpeg': jpeg,
  'image/gif': gif,
  'image/png': png,
  // 'image/webp': webp,
  'image/svg+xml': svg
}

export default {
  async optimize(file, args, parameters, optimizeByGm) {
    const { contentType } = file
    const scenario = scenarios[ mimeAliases[ contentType ] ]

    if (!scenario) {
      return file
    }

    return await scenario(file, args, parameters, optimizeByGm)
  }
}
