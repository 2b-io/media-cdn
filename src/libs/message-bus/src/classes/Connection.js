import amqp from 'amqplib'
import debug from 'debug'
import delay from 'delay'
import { Buffer } from 'safe-buffer'
import uuid from 'uuid'

class Connection {
  constructor(props) {
    this.props = {
      host: 'amqp://localhost',
      retryInterval: 5e3,
      prefix: 'mb.',
      ...props
    }

    this._id = uuid.v4()
    this._retryCount = 0
    this._ready = 0
    this._channel = null
    this._exchange = `${ this.props.prefix }global`
    this._queue = `${ this.props.prefix }${ this.props.name }`
    this._log = debug('message-bus')
  }

  log(...msg) {
    return this._log(`[${ this.props.name }]`, ...msg)
  }

  parseContent(msg) {
    return JSON.parse(msg && msg.content && msg.content.toString() || null)
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

  async connect() {
    this.log(`Connecting... retries: ${ this._retryCount }`)

    try {
      const conn = await amqp.connect(this.props.host)

      // disconnect - reconnect
      conn.once('close', async () => {
        this.log('Connection closed! Reconnecting...')

        await this._retry()
      })

      const channel = await conn.createChannel()
      // await channel.prefetch(1)

      this._setChannel(channel)
      this.log('Connected!')

      await this._init()

      return this
    } catch (e) {
      return await this._retry()
    }
  }

  async _retry() {
    this._clearChannel()

    await delay(this.props.retryInterval)

    return await this.connect()
  }

  async _init() {
    const channel = this._channel

    await channel.assertExchange(
      this._exchange,
      'direct',
      {
        durable: true
      }
    )

    await channel.assertQueue(
      this._queue,
      {
        durable: true,
        autoDelete: !!this.props.autoDelete
      }
    )

    await channel.bindQueue(this._queue, this._exchange, this.props.name)

    await channel.consume(this._queue, async (msg) => {
      this.log(`Message received: [${ msg.properties.replyTo }] -> [${ this.props.name }]`)

      if (typeof this.handleMessage === 'function') {
        await this.handleMessage(msg)
      }

      await channel.ack(msg)

      this.log('Message acknowledged')
    }, {
      noAck: false
    })
  }

  async publish(routing, content, options) {
    this.log(`Message sent: [${ this.props.name }] -> [${ routing }]`)

    return await this._channel.publish(
      this._exchange,
      routing,
      Buffer.from(
        JSON.stringify(content),
        'utf-8'
      ),
      {
        expiration: 120e3.toString(),
        contentType: 'application/json',
        contentEncoding: 'utf-8',
        timestamp: Date.now(),
        persistent: true,
        replyTo: this.props.name,
        headers: {
          from: this._id
        },
        ...options
      }
    )
  }
}

export default Connection
