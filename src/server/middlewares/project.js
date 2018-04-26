import da from 'services/da'

export default async (req, res, next) => {
  const { slug } = req._params

  const project = req._params.project = await da.getProject(slug)

  if (!project) {
    return res.sendStatus(400)
  }

  next()
}
