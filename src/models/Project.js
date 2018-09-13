import mongoose from 'infrastructure/mongoose'

const schema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  identifier: {
    type: String
  },
  description: {
    type: String
  },
  prettyOrigin: {
    type: String
  },
  status: {
    type: String
  },
  origins: [ String ],
  removed: {
    type: Boolean,
    default: false,
    index: true
  }
})

export default mongoose.model('Project', schema)
