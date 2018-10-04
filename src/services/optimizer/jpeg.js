import sharp from 'sharp'
import localpath from 'services/localpath'

export default async (file, args, parameters = {}) => {
  const {
    mode = 'cover',
    width = 'auto',
    height = 'auto'
  } = args

  const quality = parseInt(parameters.quality, 10)
  const progressive = !!parameters.progressive

  const image = sharp(file.path)

  const resize = !(width === 'auto' && height === 'auto')

  if (resize) {
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
  }

  image.jpeg({
    quality,
    progressive
  })

  const output = await localpath(file.ext)
  await image.toFile(output)

  return {
    contentType: file.contentType,
    ext: file.ext,
    path: output
  }
}
