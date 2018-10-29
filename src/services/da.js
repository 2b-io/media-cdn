import CacheSetting from 'models/cache-setting'
import Infrastructure from 'models/infrastructure'
import Preset from 'models/Preset'
import Project from 'models/Project'
import PullSetting from 'models/pull-setting'

const getCacheSetting = async (projectId) => {
  return await CacheSetting.findOne({
    project: projectId
  })
}

const getInfrastructure = async (identifier) => {
  return await Infrastructure.findOne({
    identifier
  })
}

const getInfrastructureByProjectId = async (projectId) => {
  return await Infrastructure.findOne({
    project: projectId
  })
}

const getPreset = async (contentType, project) => {
  return await Preset.findOne({
    contentType,
    project,
    isActive: true
  }).lean()
}

const getProject = async (hostName) => {
  const infrastructure = await Infrastructure.findOne({
    $or: [
      { cname: hostName },
      { domain: hostName }
    ]
  }).lean()

  const project = await Project.findOne({
    _id: infrastructure.project,
    isActive: true
  }).lean()

  return {
    infrastructure,
    project
  }
}

const getPullSetting = async (projectId) => {
  return await PullSetting.findOne({
    project: projectId
  }).lean()
}

const getProjectByIdentifier = async (identifier) => {
  return await Project.findOne({
    identifier,
    isActive: true
  }).lean()
}

export default {
  getCacheSetting,
  getInfrastructure,
  getInfrastructureByProjectId,
  getPreset,
  getProject,
  getPullSetting,
  getProjectByIdentifier
}
