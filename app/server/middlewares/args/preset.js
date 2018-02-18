import Preset from 'models/Preset'

export default (req, res, next) => {
  let { hash = 'default' } = req.params

  Preset.findOne({
    hash,
    project: req._args.project._id,
    removed: false
  })
  .lean()
  .then(preset => {
    req._args = { ...req._args, hash, preset }

    next()
  })
  .catch(next)
}
