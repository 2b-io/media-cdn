class Message {
  constructor(props) {
    this._connection = props.connection
    this._content = props.content
  }

  waitFor(key) {
    this._waitFor = key

    return this
  }

  onReply(cb) {
    this._onReply = cb

    return this
  }

  send() {
    this._connection.send(this)
  }
}

export default Message
