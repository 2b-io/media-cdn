const path = require('path')

module.exports = {
  serverPort: 3002,
  queuePrefix: 'mod',
  redis: {
    host: '127.0.0.1',
    port: 6379
  },
  aws: {
    s3: {
      bucket: '',
      region: '',
      accessKeyId: '',
      secretAccessKey: ''
    }
  },
  mongodb: 'mongodb://localhost/myapp',
  tmpDir: path.resolve(__dirname, '../tmp')
}
