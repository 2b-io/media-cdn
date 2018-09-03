import { execFile } from 'child_process'
import fs from 'fs-extra'
import imagemin from 'imagemin'
import path from 'path'
import pify from 'pify'
import pngquant from 'pngquant-bin'
import sharp from 'sharp'
import uuid from 'uuid'

import localpath from 'services/localpath'

const optimizePNG = async (input, output, args) => {
  const dir = path.join(path.dirname(output), 'png')
  await fs.ensureDir(dir)
  const outputPng = path.join(dir, uuid.v4())
  await pify(execFile)(pngquant, [
    ...args,
    '-o', outputPng, 
    input
    ])
  await fs.remove(output)
  await fs.move(outputPng, output)
}
export default async (file, args) => {
  const output = await localpath(file.ext)

  const {
    mode = 'cover',
    width = 'auto',
    height = 'auto',
    quality = 80,
    speed = 10 
  } = args

  const resize = !(width === 'auto' && height === 'auto')

  if (!resize) {
    await optimizePNG(file.path, output, {
      quality,
      speed
    })

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
    compressionLevel: 9
  })


  await image.toFile(output)

  await optimizePNG(output, output, {
    quality,
    speed
  })

  return {
    contentType: file.contentType,
    ext: file.ext,
    path: output
  }
}
