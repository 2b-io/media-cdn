import { execFile } from 'child_process'
import fs from 'fs-extra'
import gifsicle from 'gifsicle'
import path from 'path'
import pify from 'pify'
import sizeOf from 'image-size'
import uuid from 'uuid'
import localpath from 'services/localpath'

const processGif = async ({ params, additionalParams }) => {
  await pify(execFile)(gifsicle, [
    ...additionalParams,
    ...params
  ])
}

const resizeCrop = async ({ originWidth, originHeight, width, height, params, output, outputGif }) => {
  if (originWidth >= originHeight) {
    if (originWidth < width || originHeight < height) {
      if (width > height && ((height/originHeight ) > 2)) {
        return await coverFitWidth({ width, height, params, output, outputGif })
      }
    }
    if (originWidth > width || originHeight > height) {
      if (width > height) {
        return await coverFitWidth({ width, height, params, output, outputGif })
      }
    }
    return await coverFitHeight({ width, height, params, output, outputGif })
  }

  if (originWidth < originHeight) {
    if (originWidth < width || originHeight < height) {
      if (width < height && ((width/originWidth )< 2)) {
        return await coverFitHeight({ width, height, params, output, outputGif })
      }
    }
    if (originWidth > width || originHeight > height) {
      if (width < height) {
        return await coverFitHeight({ width, height, params, output, outputGif })
      }
    }
    return await coverFitWidth({ width, height, params, output, outputGif })
  }
}

const coverFitWidth = async ( { width, height, params, output, outputGif } ) =>{

  await processGif({ additionalParams: [ '--resize-width', width ], params } )
  await fs.move(outputGif, output)
  const { height: outputResizeHeight } = await pify(sizeOf(output))
  return [ '--crop', `0,${ parseInt(Math.abs(outputResizeHeight - height)/2) }+${ width }x${ height }` ]
}

const coverFitHeight = async ( { width, height, params, output, outputGif } ) =>{

  await processGif({ additionalParams: [ '--resize-height', height ], params } )
  await fs.move(outputGif, output)
  const { width: outputResizeWidth } = await pify(sizeOf(output))
  return [ '--crop', `${  parseInt(Math.abs((outputResizeWidth - width)/2)) },0+${ width }x${ height }` ]

}
const additionalParams = async ({ originWidth, originHeight, mode, width = 'auto', height = 'auto' }) => {
  if (mode === 'contain') {
    return [ '--resize-fit', `${ height }x${ width }` ]
  }
  if (mode === 'cover') {
    if (originWidth > originHeight) {
      if (originHeight > height) {
        return [
          '--crop', `${ (originWidth - width)/2 },0+${ width }x${ height }`
        ]
      }
    }
    if (originWidth < originHeight) {
      if (originWidth > width) {
        return [
          '--crop', `0, ${ (originHeight - height)/2 } +${ width }x${ height }`
        ]
      }
    }
  }
  return []
}

const optimizeGif = async (fileInput, output, args) => {

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
  //   process mode crop
  if (mode === 'crop') {
    const paramsCover = await resizeCrop({ originWidth, originHeight, mode, width, height, params, outputGif, output })
    await processGif({ params: [ '-i', output, '-o', outputGif ], additionalParams: paramsCover })
    await fs.remove(output)
    await fs.move(outputGif, output)
    return
  }
  // process mode cover and contain
  await processGif({
    params,
    additionalParams: await additionalParams({
      originWidth,
      originHeight,
      mode,
      width,
      height
    }) })
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
