import jpeg from './jpeg'

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
