import Preset from 'models/Preset'

export default (req, res, next) => {
  const hash = (
    req.query.p || req.query.preset ||
    (req.body && (req.body.p || req.body.preset)) ||
    'default'
  )

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
