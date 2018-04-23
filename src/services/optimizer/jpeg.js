import sharp from 'sharp'
import localpath from 'services/localpath'

export default async (file, args) => {
  const {
    mode = 'cover',
    width = 'auto',
    height = 'auto',
    quality = 80,
    progressive = true
  } = args

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
    quality: quality,
    progressive: progressive
  })

  const output = await localpath(file.ext)
  await image.toFile(output)

  return {
    contentType: file.contentType,
    ext: file.ext,
    path: output
  }
}
