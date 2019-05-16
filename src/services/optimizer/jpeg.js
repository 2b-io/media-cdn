import fs from 'fs-extra'
import gm from 'gm'
import path from 'path'
import sharp from 'sharp'
import uuid from 'uuid'
import localpath from 'services/localpath'
import promise from 'bluebird'

const formatRatio = async (file, quality, originRatio, ratio, width, height, output) => {
  if (originRatio < ratio) {
    return await gm(file.path).quality(quality).resize(width, null).writeAsync(output)
  }

  return await gm(file.path).quality(quality).resize(null, height).writeAsync(output)
}

const processJpegByGM = async (file, quality, resize, width = null, height = null, mode, output) => {

  promise.promisifyAll(gm.prototype)

  const { size: { width: originWidth, height: originHeight }, ['JPEG-Quality']: originQuality } = await gm(file.path).identifyAsync()

  const originRatio = originWidth / originHeight
  const ratio = width / height

  if (resize) {
    if (mode === 'cover') {
      await formatRatio(file, quality, originRatio, ratio, width, height, output)

      return
    }

    if (mode === 'contain') {
      await gm(file.path).quality(quality).resize(width, height).writeAsync(output)

      return
    }

    if (mode === 'crop') {
      const dir = path.join(path.dirname(output), 'jpeg')
      await fs.ensureDir(dir)
      const tmpFile = path.join(dir, uuid.v4())

      await formatRatio(file, quality, originRatio, ratio, width, height, tmpFile)

      await gm(tmpFile).quality(quality).gravity('Center').crop(width, height).writeAsync(output)

      await fs.remove(tmpFile)

      return
    }
  }

  if (originQuality > quality) {
    await gm(file.path).quality(quality).writeAsync(output)

    return
  }

  await gm(file.path).compress('JPEG2000').writeAsync(output)
}

export default async (file, args, parameters = {}, optimizeByGm) => {
  const {
    mode = 'cover',
    width = 'auto',
    height = 'auto'
  } = args
  const output = await localpath(file.ext)
  const quality = parseInt(parameters.quality, 10)
  const progressive = !!parameters.progressive

  const image = sharp(file.path)

  const resize = !(width === 'auto' && height === 'auto')

  if (optimizeByGm) {
    await processJpegByGM(file, quality, resize, width, height, mode, output)

    return {
      contentType: file.contentType,
      ext: file.ext,
      path: output
    }
  }

  if (resize) {
    image.resize({
      width: width === 'auto' ? null : width,
      height: height === 'auto' ? null : height,
      fit: mode === 'crop' ?
        sharp.fit.cover : (
          mode === 'cover' ?
            sharp.fit.outside :
            sharp.fit.inside
        )
    })
  }

  image.jpeg({
    quality,
    progressive
  })

  await image.toFile(output)

  return {
    contentType: file.contentType,
    ext: file.ext,
    path: output
  }
}
