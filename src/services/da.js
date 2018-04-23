import Preset from 'models/Preset'
import Project from 'models/Project'

export default {
  getPreset: async (hash, project) => {
    return await Preset.findOne({
      hash,
      project,
      removed: false
    }).lean()
  },
  getProject: async (slug) => {
    return await Project.findOne({
      slug,
      removed: false,
      disabled: false
    }).lean()
  }
}
