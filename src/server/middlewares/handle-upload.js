import mime from 'mime'
import multer from 'multer'
import uuid from 'uuid'
import config from 'infrastructure/config'

// const today = new Date()

export default multer({
  // dest: config.tmpDir
  storage: multer.diskStorage({
    destination: config.tmpDir,
    filename: (req, file, done) => done(
      null,
      // `${ today.getFullYear() }`,
      // `${ today.getMonth() }`,
      // `uuid.v4().${ mime.getExtension(file.mimetype) }`
      `${ uuid.v4() }.${ mime.getExtension(file.mimetype) }`
    )
  })
}).single('media')
