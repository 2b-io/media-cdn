import { execFile } from 'child_process'
import fs from 'fs-extra'
import gifsicle from 'gifsicle'
import path from 'path'
import pify from 'pify'
import sizeOf from 'image-size'
import uuid from 'uuid'
import localpath from 'services/localpath'

const additionalParams = ({ originWidth = 0, originHeight = 0, mode, width = 'auto', height = 'auto' }) => {
  if (mode === 'contain') {
    return [
      '--resize-fit', `${ height }x${ width }`,
    ]
  }
  if (mode === 'crop') {

    return [
      '--crop', `${ (originWidth-originHeight)/2 },0+${ width }x${ height }`
    ]
  }

  return []
}

const optimizeGif = async (input, output, args) => {

  const dir = path.join(path.dirname(output), 'gif')
  const { height, width, optimize = '-O2', mode } = args
  await fs.ensureDir(dir)

  const outputGif = path.join(dir, uuid.v4())

  const params = [
    // '--crop', '10,10+100x100',

    // '--resize', '120x120',
    // '--resize-fit', '0x120'
    optimize,
    '-i', input,
    '-o', outputGif
  ]

  const originSize = sizeOf(input)
  const { width : { originWidth }, height: { originHeight } } = originSize

  if (originWidth > originHeight) {
    if (originWidth > width || originHeight < height) {
      //  --resize-height  = height
      // output1
      // --crop (originWidth-output1 - width)/2 , 0 +  widthxheight
    }
    if (originWidth < width || originHeight > height) {
      //  --resize-width  = width
      // output1
      // --crop 0, (originHeight-output1 - height)/2 +  widthxheight
    }
  }
  if (originWidth < originHeight) {
    if (originHeight > height || originWidth < width ) {
      //  --resize-width  = width
      // output1
      // --crop 0, (originHeight-output1 - height)/2 +  widthxheight
    }
    if (originWidth > width || originHeight < height ) {
      //  --resize-height  = height
      // output1
      // --crop (originWidth-output1 - width)/2 , 0 +  widthxheight
    }
  }

  await pify(execFile)(gifsicle, [
    ...additionalParams({ originWidth, originHeight, mode, width, height }),
    ...params
  ])

  await fs.remove(output)
  await fs.move(outputGif, output)
}

export default async (file, args) => {
  const output = await localpath(file.ext)

  const {
    width = 'auto',
    height = 'auto',
    optimize
  } = args

  const resize = !(width === 'auto' && height === 'auto')

  if (!resize) {
    await optimizeGif(file.path, output, {
      optimize
    })

    return {
      contentType: file.contentType,
      ext: file.ext,
      path: output
    }
  }

  await optimizeGif(file.path, output, args)

  return {
    contentType: file.contentType,
    ext: file.ext,
    path: output
  }
}
