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

    const response = this._onMessage ?
      await this._onMessage(content, msg) : null

    if (!correlationId) {
      return
    }

    await this.reply(
      response,
      msg.properties.correlationId,
      msg.properties.replyTo
    )
  }

  async reply(response, correlationId, replyTo) {
    return await super.publish(replyTo, response, {
      correlationId
    })
  }
}

export default Consumer
