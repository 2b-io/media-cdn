import amqp from 'amqplib'
import debug from 'debug'
import uuid from 'uuid'

import delay from '../helpers/delay'

const log = debug('message-bus')

class Connection {
  constructor(props) {
    this.props = {
      host: 'amqp://localhost',
      retryInterval: 1e3,
      ...props
    }

    this._id = uuid.v4()
    this._retryCount = 0
    this._ready = 0
    this._channel = null
  }

  _setChannel(channel) {
    this._retryCount = 0
    this._ready = true
    this._channel = channel
  }

  _clearChannel() {
    this._retryCount = this._retryCount + 1
    this._ready = false
    this._channel = null
  }

  async _connect() {
    log(`Connecting... retries: ${this._retryCount}`)

    try {
      const conn = await amqp.connect(this.props.host)

      // disconnect - reconnect
      conn.once('close', async () => {
        log('Connection closed! Reconnecting...')

        await this._retry()
      })

      const channel = await conn.createChannel()

      this._setChannel(channel)
      log('Connected!')

      return channel
    } catch (e) {
      return await this._retry()
    }
  }

  async _retry() {
    this._clearChannel()

    await delay(this.props.retryInterval)

    return await this._connect()
  }
}

export default Connection
