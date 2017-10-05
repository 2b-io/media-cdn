const bluebird = require('bluebird');
const fs = require('fs');
const mime = require('mime');
const path = require('path');
const S3 = require('aws-sdk/clients/s3');
const shortHash = require('short-hash');

const s3Config = {
  bucket: 'media-on-demand',
  region: 'us-east-1',
  // accessKeyId: '',
  // secretAccessKey: ''
};
const s3 = new S3(s3Config);

function meta(media, original = false) {
  return new bluebird((resolve, reject) => {
    let key = original ?
      media.originalPath :
      media.uniquePath;

    s3.headObject({
      Bucket: s3Config.bucket,
      Key: key
    }, (err, data) => {
      if (data) {
        media.meta = data;
      }

      resolve(media);
    });
  });
}

function get(media, original = false) {
  return new bluebird((resolve, reject) => {
    let key = original ?
      media.originalPath :
      media.uniquePath;

    media._request = s3.getObject({
      Bucket: s3Config.bucket,
      Key: key
    });

    resolve(media);
  });
}

function set(media, original = false) {
  return new bluebird((resolve, reject) => {
    let key = original ?
      media.originalPath :
      media.uniquePath;

    s3.putObject({
      Bucket: s3Config.bucket,
      Key: key,
      ContentType: mime.getType(media.url),
      Body: fs.createReadStream(media.local)
    }, (err, result) => {
      console.log(err, result);

      if (err) {
        reject(err);

        return;
      }

      resolve(media);
    });
  });
}

module.exports = {
  meta,
  get,
  set
};
