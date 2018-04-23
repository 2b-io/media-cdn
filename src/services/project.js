import Project from 'models/Project'

export default {
  get: async (slug) => {
    return await Project.findOne({
      slug,
      removed: false,
      disabled: false
    }).lean()
  }
}
