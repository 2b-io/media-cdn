const bluebird = require('bluebird');
const fs = require('fs');
const mime = require('mime');
const path = require('path');
const S3 = require('aws-sdk/clients/s3');
const shortHash = require('short-hash');

let s3;

function init(s3Config) {
  s3 = new S3(s3Config);
}

function meta(media, original = false) {
  return new bluebird((resolve, reject) => {
    let key = original ?
      media.originalPath :
      media.uniquePath;

    s3.headObject({
      Bucket: s3.config.bucket,
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
      Bucket: s3.config.bucket,
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
      Bucket: s3.config.bucket,
      Key: key,
      ContentType: mime.getType(media.url),
      Body: fs.createReadStream(media.createLocalPath(original))
    }, (err, result) => {
      if (err) {
        reject(err);

        return;
      }

      resolve(media);
    });
  });
}

module.exports = {
  init,
  meta,
  get,
  set
};
