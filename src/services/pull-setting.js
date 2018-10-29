import PullSetting from 'models/pull-setting'

export const get = async (project) => {
  return await PullSetting.findOne({
    project
  }).lean()
}

export const update = async (project, data) => {
  return await PullSetting.findOneAndUpdate(
    { project },
    { ...data },
    { new: true }
  ).lean()
}
