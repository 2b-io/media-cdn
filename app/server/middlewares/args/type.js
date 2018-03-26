import match from 'mime-match'

const mimeMatch = mime => type => match(mime, type)

export default function getTypeArg(req, res, next) {
  try {
    const { mime } = req._args
    const match = mimeMatch(mime)

    if (match('image/jpeg') || match('image/png')) {
      req._args.type = 'image'
    } else if (match('text/css')) {
      req._args.type = 'css'
    } else if (match('application/javascript')) {
      req._args.type = 'javascript'
    } else {
      req._args.type = 'other'
    }
  } catch (error) {
    return next(error)
  }

  next()
}
