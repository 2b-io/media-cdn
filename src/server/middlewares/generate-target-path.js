import sh from 'shorthash'

const SUPPORT_RESIZE = [
  'image/jpeg',
  'image/gif',
  'image/png'
]

export default function generateTargetPath(req, res, next) {
  const { preset } = req._params

  if (!preset) {
    req._params.target = req._params.origin
    req._targetMeta = req._originMeta

    return next()
  }

  const {
    args: {
      mode = 'cover',
      width = 'auto',
      height = 'auto'
    },
    project: { identifier },
    preset: { contentType, parameters = {} },
    hashedURL,
    ext
  } = req._params

  const presetHash = sh.unique(
    JSON.stringify(
      parameters,
      Object.keys(parameters).sort()
    )
  )

  // TODO generate target depends on content-type
  const resizable = SUPPORT_RESIZE.includes(contentType)

  req._params.target = resizable ?
    `${ identifier }/${ hashedURL }/${ presetHash }/${ mode }_${ width }x${ height }.${ ext }` :
    `${ identifier }/${ hashedURL }/${ presetHash }.${ ext }`

  next()
}
