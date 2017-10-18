const bluebird = require('bluebird');
const download = require('download');
const fs = require('fs');
const path = require('path');
const pick = require('object.pick');
const shortHash = require('short-hash');

class Media {
  static create(props) {
    return new Media(props);
  }

  constructor(props) {
    let {
      tenant,
      url,
      preset = {
        id: 'default'
      },
      width = 'auto',
      height = 'auto'
    } = props;

    this.tenant = tenant;
    this.url = url;
    this.preset = preset;
    this.width = width;
    this.height = height;
  }

  toJSON() {
    return pick(this, [
      'tenant',
      'url',
      'preset',
      'width',
      'height',
      'meta'
    ]);
  }

  toStream() {
    return this._request.createReadStream ?
      this._request.createReadStream() :
      this._request;
  }

  createLocalPath(original = true) {
    if (original) {
      return path.join(__dirname, 'tmp', shortHash(this.url));
    } else {
      return path.join(__dirname, 'tmp', this.hash);
    }
  }

  fetch(original = true) {
    return new bluebird((resolve, reject) => {
      let outPath = this.createLocalPath();

      download(this.url)
        .pipe(fs.createWriteStream(outPath))
        .on('finish', () => {
          this.local = outPath;

          resolve(this);
        });
    });
  }

  save() {
    return new bluebird((resolve, reject) => {
      let outPath = path.join(__dirname, 'tmp', shortHash(this.url));

      this
        .toStream()
        .pipe(fs.createWriteStream(outPath))
        .on('finish', () => {
          this.local = outPath;

          resolve(this);
        });
    });
  }

  disposeOriginal() {
    let originalPath = this.createLocalPath(true);
    fs.unlink(originalPath, err => {});
  }

  disposeOptimize() {
    let optimizePath = this.createLocalPath(false);
    fs.unlink(optimizePath, err => {});
  }

  get uniquePath() {
    let {
      tenant,
      url,
      preset = 'default',
      width = 'auto',
      height = 'auto'
    } = this;

    let hash = shortHash(url);
    let filename = path.basename(url);

    return `media/${tenant}/${hash}/${preset.id}/${width}/${height}/${filename}`;
  }

  get originalPath() {
    let {
      tenant,
      url,
    } = this;

    let hash = shortHash(url);
    let filename = path.basename(url);

    return `media/${tenant}/${hash}/${filename}`;
  }

  get hash() {
    return shortHash(JSON.stringify(this.toJSON()));
  }
}

module.exports = Media;
