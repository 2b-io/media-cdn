import Infrastructure from 'models/infrastructure'
import Preset from 'models/Preset'
import Project from 'models/Project'
import PullSetting from 'models/pull-setting'

export default {
  getPreset: async (contentType, project) => {
    return await Preset.findOne({
      contentType,
      project,
      isActive: true
    }).lean()
  },
  getProject: async (hostName) => {
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
  },
  getPullSetting: async (project) => {
    return await PullSetting.findOne({
      project
    }).lean()
  }
}
