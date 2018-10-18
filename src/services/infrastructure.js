import Infrastructure from 'models/infrastructure'

export const getInfrastructure = async ({ project }) => {
  return await Infrastructure.findOne({
    project
  }).lean()
}
