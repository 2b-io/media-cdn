import jpeg from './jpeg'
import png from './png'

export default {
  optimize: async (file, opts) => {
    console.log('optimizer.js: ', file)

    const { contentType } = file

    switch (contentType) {
      case 'image/jpeg':
        // optimize jpeg
        return await jpeg(file, opts)

      case 'image/png':
        // optimize png
        return await png(file, opts)

      case 'image/gif':
        // optimize gif

      case 'image/webp':
        // optimize webp

      case 'image/bmp':
        // optimze bmp
    }

    return file
  }
}
