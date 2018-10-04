import fs from 'fs-extra'
import imagemin from 'imagemin'
import imageminSvgo  from 'imagemin-svgo'
import path from 'path'
import localpath from 'services/localpath'

const optimizeSVG = async (input, output, plugins) => {
  const dir = path.join(path.dirname(output), 'svg')

  await fs.ensureDir(dir)

  const files = await imagemin([ input ], dir, {
    use: [
      imageminSvgo({
        plugins
      })
    ]
  })
  await fs.remove(output)
  await fs.move(files[0].path, output)
}

export default async (file, args, parameters = {}) => {
  const output = await localpath(file.ext)

  const {
    cleanupAttrs = true,
    inlineStyles = false,
    removeDoctype = false,
    removeXMLProcInst = false,
    removeComments = true,
    removeEmptyAttrs = false,
    removeHiddenElems = false,
    removeEmptyText = true,
    removeEmptyContainers = true,
    minifyStyles = true,
    convertColors = true,
    convertPathData = true,
    convertTransform = true,
    removeUnknownsAndDefaults = true,
    removeUselessStrokeAndFill = true,
    cleanupNumericValues = true,
    collapseGroups = true,
    mergePaths = true,
    removeNonInheritableGroupAttrs = true,
    cleanupIDs = true,
    removeStyleElement = true,
  } = parameters

  const plugins = [
    { cleanupAttrs },
    { inlineStyles },
    { removeDoctype },
    { removeXMLProcInst },
    { removeComments },
    { removeEmptyAttrs },
    { removeHiddenElems },
    { removeEmptyText },
    { removeEmptyContainers },
    { minifyStyles },
    { convertColors },
    { convertPathData },
    { convertTransform },
    { removeUnknownsAndDefaults },
    { removeNonInheritableGroupAttrs },
    { removeUselessStrokeAndFill },
    { cleanupIDs },
    { cleanupNumericValues },
    { collapseGroups },
    { mergePaths },
    { removeStyleElement }
  ]

  await optimizeSVG(file.path, output, plugins)

  return {
    contentType: file.contentType,
    ext: file.ext,
    path: output
  }
}
