const path = require('path');
const shortHash = require('short-hash');

class Media {
  static create(props) {
    return new Media(props);
  }

  constructor(props) {
    let {
      tenant,
      url,
      preset = 'default',
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
    return this;
  }

  toStream() {
    return this._request.createReadStream();
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

    return `media/${tenant}/${hash}/${preset}/${width}/${height}/${filename}`;
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
