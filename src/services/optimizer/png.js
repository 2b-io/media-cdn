import fs from 'fs-extra'
import imagemin from 'imagemin'
import imageminPngquant  from 'imagemin-pngquant'
import sharp from 'sharp'
import localpath from 'services/localpath'

const optimizePNG = async (input, output) => {
  const dir = await localpath()

  const files =  await imagemin([ input ], dir, {
    use: [ imageminPngquant({
      quality: 75,
      speed: 10
    }) ]
  })

  await fs.remove(output)
  await fs.move(files[0].path, output)
}

export default async (file, args) => {
  const output = await localpath(file.ext)

  const {
    mode = 'cover',
    width = 'auto',
    height = 'auto'
  } = args

  const resize = !(width === 'auto' && height === 'auto')

  if (!resize) {
    await optimizePNG(file.path, output)

    return {
      contentType: file.contentType,
      ext: file.ext,
      path: output
    }
  }

  const image = sharp(file.path)

  image.resize(
    width === 'auto' ? null : width,
    height === 'auto' ? null : height
  )

  if (mode === 'cover') {
    image.min()
  } else if (mode === 'contain') {
    image.max()
  } else if (mode === 'crop') {
    image.crop()
  }

  image.png({
    compressionLevel: 8,
    // progressive: true
  })


  await image.toFile(output)

  await optimizePNG(output, output)

  return {
    contentType: file.contentType,
    ext: file.ext,
    path: output
  }
}
