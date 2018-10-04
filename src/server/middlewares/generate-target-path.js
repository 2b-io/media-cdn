import sh from 'shorthash'

export default async function generateTargetPath(req, res, next) {
  const {
    args: {
      mode = 'cover',
      width = 'auto',
      height = 'auto'
    },
    project: { identifier },
    preset: { contentType, parameters },
    urlHash,
    ext
  } = req._params

  const presetHash = sh.unique(
    JSON.stringify(
      parameters,
      Object.keys(parameters).sort()
    )
  )
  req._params.target = `${ identifier }/${ urlHash }/${ presetHash }/${ mode }_${ width }x${ height }.${ ext }`

  next()
  }
