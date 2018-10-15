import Project from 'models/Project'

export const getProjectByIdentifier = async (identifier) => {
  return await Project.findOne({
    identifier,
    isActive: true
  }).lean()
}
