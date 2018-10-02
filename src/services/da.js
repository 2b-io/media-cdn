import Preset from 'models/Preset'
import Project from 'models/Project'
import PullSetting from 'models/pull-setting'

export default {
  getPreset: async (hash, project) => {
    return await Preset.findOne({
      hash,
      project,
      removed: false
    }).lean()
  },
  getProject: async ({ identifier }) => {
    return await Project.findOne({
      identifier,
      removed: false,
      isActive: true
    }).lean()
  },
  getAllowedOrigins: async (project) => {
    return await PullSetting.findOne({
      project
    }).lean()
  }
}
