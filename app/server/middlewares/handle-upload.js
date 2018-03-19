import multer from 'multer'
import config from 'infrastructure/config'

export default multer({ dest: config.tmpDir }).single('media')
