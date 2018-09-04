import { execFile } from 'child_process'
import fs from 'fs-extra'
import gifsicle from 'gifsicle'
import path from 'path'
import pify from 'pify'
import sizeOf from 'image-size'
import uuid from 'uuid'
import localpath from 'services/localpath'

const executeGifsicle = async (params) => {
  return await pify(execFile)(gifsicle, params)
}

const getResizeParams = (originWidth, originHeight, width, height, mode) => {
  // resize by width or height
  if (width === 'auto') {
    return [ '--resize-height', height ]
  }

  if (height === 'auto') {
    return [ '--resize-width', width ]
  }

  // resize by BOTH width and height
  const originRatio = originWidth / originHeight
  const ratio = width / height

  if (mode === 'contain') {
    if (originRatio < ratio) {
      return [ '--resize-height', height ]
    } else {
      return [ '--resize-width', width ]
    }
  } else if (mode === 'cover' || mode === 'crop') {
    if (originRatio < ratio) {
      return [ '--resize-width', width ]
    } else {
      return [ '--resize-height', height ]
    }
  }

  // never happens (mode in not 'contain', 'cover' or 'crop')
  return []
}

const cropGIF = async (originWidth, originHeight, width, height, file, keepWidth) => {
  const tmpDir = path.join(path.dirname(file), 'gif')
  const tmpFile = path.join(tmpDir, `${ uuid.v4() }.gif`)

  await fs.ensureDir(tmpDir)
  await fs.move(file, tmpFile)

  const originRatio = originWidth / originHeight

  const cropParams = keepWidth ?
    `0,${ Math.ceil(Math.abs((width / originRatio) - height) / 2) }+${ width }x${ height }` :
    `${ Math.ceil(Math.abs((height * originRatio) - width) / 2) },0+${ width }x${ height }`

  try {
    await executeGifsicle([
      '--crop',
      cropParams,
      '-i', tmpFile,
      '-o', file
    ])
  } finally {
    await fs.remove(tmpFile)
  }
}

const optimizeGIF = async (input, output, { width = 'auto', height = 'auto', mode }) => {
  const { width: originWidth, height: originHeight } = await pify(sizeOf)(input)

  const needResize = !(width === 'auto' && height === 'auto')

  const baseParams = [
    '-O2',
    '-i', input,
    '-o', output
  ]

  const resizeParams = needResize ?
    getResizeParams(originWidth, originHeight, width, height, mode) :
    []

  await executeGifsicle([
    ...resizeParams,
    ...baseParams
  ])

  if (mode === 'crop' && width !== 'auto' && height !== 'auto') {
    await cropGIF(originWidth, originHeight, width, height, output, resizeParams[0] === '--resize-width')
  }
}

export default async (file, args) => {
  const output = await localpath(file.ext)

  await optimizeGIF(file.path, output, args)

  return {
    contentType: file.contentType,
    ext: file.ext,
    path: output
  }
}
