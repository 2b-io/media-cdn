import sharp from 'sharp'
import localpath from 'services/localpath'

export default async (file, args) => {
  const {
    mode = 'cover',
    width = 'auto',
    height = 'auto'
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
    quality: 75,
    progressive: true
  })

  const output = await localpath()
  await image.toFile(file.ext ? `${output}.${file.ext}` : output)

  return {
    contentType: file.contentType,
    ext: file.ext,
    path: file.ext ? `${output}.${file.ext}` : output
  }
}
