import Project from 'models/Project'

export default (req, res, next) => {
  const { slug } = req.params

  Project.findOne({
    slug,
    removed: false,
    disabled: false
  })
  .lean()
  .then(project => {
    req._args = { ...req._args, slug, project }

    next()
  })
  .catch(next)
}
