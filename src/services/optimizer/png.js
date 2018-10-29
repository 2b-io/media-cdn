import { execFile } from 'child_process'
import fs from 'fs-extra'
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
  try {
    await pify(execFile)(pngquant, [
      ...args,
      '-o', outputPng,
      input
    ])
  } catch (error) {
    console.error('OPTIMIZE_TARGET', error)

    if (error.code == 99) {
      await fs.move(input, output)
    }

    return
  }

  await fs.remove(output)
  await fs.move(outputPng, output)
}

export default async (file, args, parameters = {}) => {
  const output = await localpath(file.ext)

  // arguments for resizing
  const {
    mode = 'cover',
    width = 'auto',
    height = 'auto'
  } = args

  // parameters for optimizing
  const minQuality = parseInt(parameters.minQuality, 10)
  const maxQuality = parseInt(parameters.maxQuality, 10)
  const speed = parseInt(parameters.speed, 10)

  const resize = !(width === 'auto' && height === 'auto')

  if (resize) {
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

    image.png()

    await image.toFile(output)
  }

  await optimizePNG(resize ? output : file.path, output, [
    '--quality', `${ minQuality }-${ maxQuality }`,
    '--speed', speed
  ])

  return {
    contentType: file.contentType,
    ext: file.ext,
    path: output
  }
}
