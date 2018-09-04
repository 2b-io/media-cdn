import { execFile } from 'child_process'
import fs from 'fs-extra'
import gifsicle from 'gifsicle'
import path from 'path'
import pify from 'pify'
import sizeOf from 'image-size'
import uuid from 'uuid'
import localpath from 'services/localpath'

const processGif = async ({ paramsGif }) => {
  await pify(execFile)(gifsicle, [
    ...paramsGif
  ])
}

const resizeCrop = async ({ originWidth, originHeight, width, height, params, output }) => {

  const ratio = width / height
  const originRatio = originWidth / originHeight

  // width x height rong hon originWidth x originHeight
  if (ratio < originRatio) {
    // resize theo height
    return await coverFitHeight({ width, height, params, output })

  } else {
    // resize theo width
    return await coverFitWidth({ width, height, params, output })
  }

}

const coverFitWidth = async ( { width, height, params, output } ) =>{

  await processGif({ paramsGif: [ ...params, '--resize-width', width ] })
  // await fs.move(outputGif, output)
  const { height: outputResizeHeight } = await pify(sizeOf(output))

  return [ '--crop', `0,${ parseInt(Math.abs(outputResizeHeight - height) / 2) }+${ width }x${ height }` ]
}

const coverFitHeight = async ( { width, height, params, output } ) =>{

  await processGif({ paramsGif: [ ...params, '--resize-height', height ] } )
  // await fs.move(outputGif, output)
  const { width: outputResizeWidth } = await pify(sizeOf(output))
  return [ '--crop', `${  parseInt(Math.abs((outputResizeWidth - width) / 2)) },0+${ width }x${ height }` ]

}
const additionalParams = ({ originWidth, originHeight, mode, width = 'auto', height = 'auto' }) => {
  if (mode === 'contain') {
    if ( height === 'auto') {
      return [
        '--resize-fit-width', `${ width }`
      ]
    }
    if ( width === 'auto') {
      return [
        '--resize-fit-height', `${ height }`
      ]
    }
    return [
      '--resize-fit', `${ width }x${ height }`
    ]
  }
  if (mode === 'cover') {
    // landscape
    const ratio = width / height
    const originRatio = originWidth / originHeight
    if (originWidth >= originHeight) {
      if (height === 'auto' || originRatio < ratio) {
        return [
          '--resize-width', `${ width }`
        ]
      }
      return [
        '--resize-height', `${ height }`
      ]
    } else {
      if (width === 'auto' || originRatio > ratio) {
        return [
          '--resize-height', `${ height }`
        ]
      }
      return [
        '--resize-width', `${ width }`
      ]
    }
  }
  return []
}


const optimizeGif = async (
  fileInput,
  output,
  args
) => {

  const dir = path.join(path.dirname(output), 'gif')
  const { height, width, optimize = '-O2', mode } = args

  //  check exist the dir if not exist create dir
  await fs.ensureDir(dir)
  const outputGif = path.join(dir, uuid.v4())

  const params = [
    optimize,
    '-i', fileInput,
    '-o', outputGif
  ]

  const originSize = await pify(sizeOf(fileInput))

  const { width: originWidth, height: originHeight } = originSize
  if (width > originWidth || height > originHeight) {
    return
  }
  //   process mode crop
  if (mode === 'crop') {
    // step 1: resize & optimize -> resize only
    // output = ket qua lan 1
    const cropParams = await resizeCrop({ originWidth, originHeight, mode, width, height, params, output: outputGif })

    await fs.move(outputGif, output)


    // step 2: crop & optimize
    await processGif({ paramsGif: [ ...cropParams, '-i', output, '-o', outputGif ] })

    // xoa output file o step 1
    await fs.remove(output)

    // move output file o step 2 ve file ket qua
    await fs.move(outputGif, output)

    return
  }

  // process mode cover and contain
  await processGif({
    paramsGif: [
      ...additionalParams({
        originWidth,
        originHeight,
        mode,
        width,
        height
      }),
      ...params
    ],
  })

  await fs.remove(output)
  await fs.move(outputGif, output)
}


export default async (file, args) => {
  const output = await localpath(file.ext)

  await optimizeGif(file.path, output, args)

  return {
    contentType: file.contentType,
    ext: file.ext,
    path: output
  }
}
