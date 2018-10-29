import mongoose from 'infrastructure/mongoose'

const schema = mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  ttl: {
    type: Number
  }
}, {
  collection: 'cacheSettings'
})

export default mongoose.model('CacheSetting', schema)
