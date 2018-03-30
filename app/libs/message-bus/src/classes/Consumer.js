import Connection from './Connection'

class Consumer extends Connection {
  constructor(props) {
    super({
      name: 'consumer',
      ...props,
      type: 'consumer'
    })
  }

  async onMessage(cb) {
    this._onMessage = cb

    return this
  }

  async handleMessage(msg) {
    const content = this.parseContent(msg)
    const { correlationId } = msg.properties

    if (!correlationId) {
      return
    }

    const response = typeof this._onMessage === 'function' ?
      await this._onMessage(content, msg) : null

    await this.reply(
      response,
      msg.properties.correlationId
    )
  }

  async reply(response, correlationId) {
    const channel = this._channel

    return await channel.publish(
      this._exchange,
      'producer',
      new Buffer(
        JSON.stringify({
          ...response,
          from: this._id
        })
      ),
      {
        correlationId,
        contentType: 'application/json',
        contentEncoding: 'utf8',
        timestamp: Date.now(),
        persistent: true,
        appId: this.props.name
      }
    )
  }
}

export default Consumer
