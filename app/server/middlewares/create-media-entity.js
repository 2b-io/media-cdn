import Media from 'entities/Media'

export default (req, res, next) => {
  req._media = Media.create({
    ...req._args
  })

  next()
}
