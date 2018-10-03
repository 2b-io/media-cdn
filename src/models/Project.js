import sh from 'shorthash'
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
  status: {
    type: String
  },
  removed: {
    type: Boolean,
    default: false,
    index: true
  },
  created: {
    type: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
})
schema.pre('save', function (next) {
  if (!this.identifier) {
    this.identifier = sh.unique(String(this._id))
  }

  if (!this.created) {
    this.created = Date.now()
  }

  next()
})
export default mongoose.model('Project', schema)
