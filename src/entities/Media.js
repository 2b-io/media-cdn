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
}

module.exports = Media;
