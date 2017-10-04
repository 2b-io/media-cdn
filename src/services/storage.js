const bluebird = require('bluebird');
const path = require('path');
const S3 = require('aws-sdk/clients/s3');
const shortHash = require('short-hash');

const s3Config = {
  bucket: 'media-on-demand',
  region: 'us-east-1',
};
const s3 = new S3(s3Config);

function _uniquePath({
  tenant,
  url,
  preset = 'default',
  width = 'auto',
  height = 'auto'
}) {
  let hash = shortHash(url);
  let filename = path.basename(url);

  return `media/${tenant}/${hash}/${preset}/${width}/${height}/${filename}`;
}

function meta(media) {
  return new bluebird((resolve, reject) => {
    let key = _uniquePath(media);

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

function get(media) {
  return new bluebird((resolve, reject) => {
    let key = _uniquePath(media);

    media._request = s3.getObject({
      Bucket: s3Config.bucket,
      Key: key
    });

    resolve(media);
  });
}

function set(media) {

}

module.exports = {
  meta,
  get,
  set
};
