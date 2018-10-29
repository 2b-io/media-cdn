import mongoose from 'infrastructure/mongoose'

const schema = mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  contentType: {
    type: String,
    required: true,
    index: true
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  }
})
schema.index({ project: 1, contentType: 1 }, { unique: true })

export default mongoose.model('Preset', schema)
