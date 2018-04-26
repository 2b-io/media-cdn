const path = require('path')

module.exports = {
  development: true,
  version: '0.1',
  server: {
    url: 'http://localhost:3002',
    port: 3002
  }
  queuePrefix: 'mod',
  redis: {
    host: '127.0.0.1',
    port: 6379
  },
  amq: {
    host: 'amqp://localhost',
    prefix: 'cdn.'
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
