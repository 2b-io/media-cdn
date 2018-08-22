import fs from 'fs-extra'
import imagemin from 'imagemin'
import imageminSvgo  from 'imagemin-svgo'
import path from 'path'
import localpath from 'services/localpath'

const optimizeSVG = async (input, output, args) => {

  const dir = path.join(path.dirname(output), 'svg')

  await fs.ensureDir(dir)

  const files =  await imagemin([ input ], dir, {
    use: [
      imageminSvgo({
        plugins: args
      })
    ]
  })
  await fs.remove(output)
  await fs.move(files[0].path, output)
}

export default async (file, args) => {
  const output = await localpath(file.ext)
  args = [
    {
      convertColors: true
    }, {
      removeComments: true
    }, {
      minifyStyles: true
    }, {
      removeUselessStrokeAndFill: true
    }, {
      mergePaths: true
    }, {
      cleanupAttrs: true
    }, {
      removeEmptyText: true
    }, {
      removeDoctype: true
    }, {
      removeEmptyContainers: true
    }, {
      collapseGroups: true
    }, {
      removeNonInheritableGroupAttrs: true
    }, {
      removeUnknownsAndDefaults: true
    }, {
      convertPathData: true
    }, {
      removeHiddenElems: true
    }, {
      convertTransform: true
    }, {
      cleanupIDs: true
    }, {
      cleanupNumericValues: true
    }, {
      removeStyleElement: true
    }
  ]
  await optimizeSVG(file.path, output, args)

  return {
    contentType: file.contentType,
    ext: file.ext,
    path: output
  }
}
