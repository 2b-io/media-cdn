import { execFile } from 'child_process'
import fs from 'fs-extra'
import gifsicle from 'gifsicle'
import path from 'path'
import pify from 'pify'
import sizeOf from 'image-size'
import uuid from 'uuid'
import localpath from 'services/localpath'

const resize = async ( { params, resizeParams }) => {
  await pify(execFile)(gifsicle, [
    ...resizeParams,
    ...params
  ])
}
const coverFitWidth = async ( { params, width, height } ) =>{
  const outputResize =  await resize({ params, resizeParams: [ '--resize-height', height ] } )
  const { width: outputResizeWidth } = outputResize
  return [ '--crop', `${ (outputResizeWidth - width)/2 } , 0 +  ${ width }x${ height }` ]
}

const coverFitHeight = async ( { params, width, height } ) =>{
  const outputResize = await resize({ params, resizeParams: [ '--resize-width', width ] } )
  const { height: outputResizeHeight } = outputResize
  return [ '--crop', `${ 0, (outputResizeHeight - height)/2 } +  ${ width }x${ height }` ]
}
const additionalParams = async ({ originWidth, originHeight, mode, width = 'auto', height = 'auto', params }) => {
  if (mode === 'contain') {
    return [
      '--resize-fit', `${ height }x${ width }`,
    ]
  }
  if (mode === 'crop') {
    if (originWidth > originHeight) {
      return [
        '--crop', `${ (originWidth-originHeight)/2 },0+${ width }x${ height }`
      ]
    }
    if (originWidth < originHeight) {
      return [
        '--crop', `${ (originWidth-originHeight)/2 },0+${ width }x${ height }`
      ]
    }
  }
  if (mode === 'cover') {
    if (originWidth >= originHeight) {
      if (originWidth >= width || originHeight <= height) {
        coverFitWidth({ params, width, height })
      }
      if (originWidth <= width || originHeight >= height) {
        coverFitHeight({ params, width, height })
      }
    }
    if (originWidth <= originHeight) {
      if (originHeight >= height || originWidth <= width ) {
        coverFitHeight({ params, width, height })
      }
      if (originWidth >= width || originHeight <= height ) {
        coverFitWidth({ params, width, height })
      }
    }
  }

  return []
}

const optimizeGif = async (input, output, args) => {

  const dir = path.join(path.dirname(output), 'gif')
  const { height, width, optimize = '-O2', mode } = args
  await fs.ensureDir(dir)

  const outputGif = path.join(dir, uuid.v4())

  const params = [
    optimize,
    '-i', input,
    '-o', outputGif
  ]
  const originSize = sizeOf(input)

  const { width: originWidth, height: originHeight } = originSize
  await pify(execFile)(gifsicle, [
    ...additionalParams({ originWidth, originHeight, mode, width, height, params }),
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
