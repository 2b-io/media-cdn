import mongoose from 'mongoose'
import config from 'infrastructure/config'

mongoose.Promise = Promise
mongoose.connect(config.mongodb, {
  promiseLibrary: Promise
})

export default mongoose
