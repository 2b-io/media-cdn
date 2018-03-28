import uuid from 'uuid'

import Connection from './Connection'
import Message from './Message'

class Producer extends Connection {
  constructor(props) {
    super({
      name: 'producer',
      ...props,
      type: 'producer'
    })

    this._callbacks = {}
  }

  async handleMessage(msg) {
    const correlationId = msg.properties.correlationId

    const callback = this._callbacks[correlationId]

    if (typeof callback === 'function') {
      this._callbacks[correlationId] = null

      await callback(null, msg)
    }
  }

  request(content) {
    return new Message({
      content,
      connection: this
    })
  }

  async publish(msg, callback) {
    const channel = this._channel
    const correlationId = callback && uuid.v4()

    if (callback) {
      this._callbacks[correlationId] = callback
    }

    return await channel.publish(
      this._exchange,
      'consumer',
      new Buffer(
        JSON.stringify({
          ...msg,
          from: this._id
        })
      ),
      {
        correlationId,
        replyTo: this._queue,
        contentType: 'application/json',
        contentEncoding: 'utf8',
        timestamp: Date.now(),
        persistent: true,
        appId: this.props.name
      }
    )
  }
}

export default Producer
