import Connection from './Connection'

class Consumer extends Connection {
  constructor(props) {
    super({
      name: 'consumer',
      ...props,
      type: 'consumer'
    })
  }

  async register() {
    await this._connect()

    return this
  }

  async handleMessage(msg) {
    const content = JSON.parse(msg.content.toString())

    console.log(content)

    await this.reply(
      { data: 'xxx', },
      msg.properties.correlationId,
      msg.properties.replyTo
    )
  }

  async reply(msg, correlationId, replyTo) {
    const channel = this._channel

    return await channel.publish(
      this._exchange,
      'producer',
      new Buffer(
        JSON.stringify({
          ...msg,
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
