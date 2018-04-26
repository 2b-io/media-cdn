class Message {
  constructor({ producer }) {
    this._producer = producer
  }

  content(content) {
    this._content = content

    return this
  }

  waitFor(key) {
    this._waitFor = key

    return this
  }

  onReply(cb) {
    this._onReply = cb

    return this
  }

  sendTo(name) {
    this._sendTo = name

    return this
  }

  ttl(duration) {
    this._ttl = duration

    return this
  }

  async send() {
    return await this._producer.send(this)
  }
}

export default Message
