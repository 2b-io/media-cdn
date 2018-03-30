import deferred from 'deferred'
import delay from 'delay'
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
    this._pool = {}
  }

  async handleMessage(msg) {
    const correlationId = msg.properties.correlationId

    const callback = this._callbacks[correlationId]

    if (callback) {
      callback.resolve(msg)
    }
  }

  request(content) {
    return new Message({
      content,
      connection: this
    })
  }

  async publish(msg, expectReply = true) {
    const channel = this._channel
    const correlationId = expectReply ? uuid.v4() : undefined

    if (expectReply) {
      this._callbacks[correlationId] = deferred()
    }

    await channel.publish(
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

    if (!expectReply) {
      return
    }

    return this._callbacks[correlationId].promise
  }

  async send(msg) {
    const waitFor = msg._waitFor

    if (!waitFor) {
      try {
        const reply = await this.mockSend(msg)
        const content = this.parseContent(reply)

        msg._onReply(null, content, reply)
      } catch (error) {
        msg._onReply(error)
      }

      return
    }

    // look in pool
    this._pool[waitFor] = this._pool[waitFor] || []

    const waitList = this._pool[waitFor]
    const isFirst = waitList.length === 0

    if (isFirst) {
      this.log('doing job')
    } else {
      this.log('waiting results')
    }

    waitList.push(msg)

    if (isFirst) {
      let waitJob

      try {
        const reply = await this.mockSend(msg)
        const content = this.parseContent(reply)

        while (waitJob = waitList.shift()) {
          waitJob._onReply(null, content, reply)
        }

      } catch (error) {
        while (waitJob = waitList.shift()) {
          waitJob._onReply(error)
        }
      }
    }
  }

  async mockSend(msg) {
    if (!msg._ttl) {
      return await this.publish(msg._content, !!msg._onReply)
    }

    const timer = delay(msg._ttl)

    const reply = await Promise.race([
      this.publish(msg._content, !!msg._onReply),
      this.ttl(timer)
    ])

    timer.cancel()

    return reply
  }

  async ttl(timer) {
    await timer

    this.log('timeout')

    throw new Error('timeout')
  }
}

export default Producer
