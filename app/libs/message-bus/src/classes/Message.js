class Message {
  constructor({ connection }) {
    this._connection = connection
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

  ttl(duration) {
    this._ttl = duration

    return this
  }

  async send() {
    return await this._connection.send(this)
  }
}

export default Message
