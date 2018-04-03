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

    this._defs = {}
    this._pool = {}
  }

  async handleMessage(msg) {
    const correlationId = msg.properties.correlationId

    const deferred = this._defs[correlationId]

    if (deferred) {
      deferred.resolve(msg)
    }
  }

  request() {
    return new Message({
      producer: this
    })
  }

  async publish(content, expectReply = true) {
    const channel = this._channel
    const correlationId = expectReply ? uuid.v4() : undefined

    if (expectReply) {
      this._defs[correlationId] = deferred()
    }

    await super.publish('consumer', content, {
      correlationId
    })

    return expectReply ? this._defs[correlationId].promise : null
  }

  async send(msg) {
    const waitFor = msg._waitFor

    if (!waitFor) {
      try {
        const reply = await this.sendWithTimeout(msg)

        if (msg._onReply) {
          const content = this.parseContent(reply)

          msg._onReply(null, content, reply)
        }
      } catch (error) {
        msg._onReply && msg._onReply(error)
      }

      return
    }

    // look in pool
    this._pool[waitFor] = this._pool[waitFor] || []

    const waitList = this._pool[waitFor]
    const isFirst = waitList.length === 0

    waitList.push(msg)

    if (isFirst) {
      let waitJob

      try {
        const reply = await this.sendWithTimeout(msg)
        const content = this.parseContent(reply)

        while (waitJob = waitList.shift()) {
          waitJob._onReply && waitJob._onReply(null, content, reply)
        }

      } catch (error) {
        while (waitJob = waitList.shift()) {
          waitJob._onReply && waitJob._onReply(error)
        }
      }
    }
  }

  async sendWithTimeout(msg) {
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

    throw new Error('timeout')
  }
}

export default Producer
