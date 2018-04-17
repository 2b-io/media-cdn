import mongoose from 'infrastructure/mongoose'

const schema = mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  values: {
    quality: {
      type: Number,
      default: 75
    },
    step: {
      type: Number,
      default: 8
    }
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  hash: {
    type: String,
    required: true
  },
  removed: {
    type: Boolean,
    default: false,
    index: true
  }
})

schema.index({
  project: 1,
  hash: 1
}, {
  unique: true
})

export default mongoose.model('Preset', schema)
