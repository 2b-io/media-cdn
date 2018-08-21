import mime from 'mime'
import multer from 'multer'
import uuid from 'uuid'
import config from 'infrastructure/config'

export default multer({
  // dest: config.tmpDir

  storage: multer.diskStorage({
    destination: config.tmpDir,
    filename: (req, file, done) => {
      const today = new Date()
      return done(
        null,
        `${ today.getFullYear() }/${ today.getMonth() }/${ uuid.v4() }.${ mime.getExtension(file.mimetype) }`
      ) }
  })
}).single('media')
