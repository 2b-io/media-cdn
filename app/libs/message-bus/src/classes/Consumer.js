import Connection from './Connection'

class Consumer extends Connection {
  constructor(props) {
    super({
      name: 'consumer',
      ...props
    })
  }

  async register() {
    await this._connect()

    await this._initQueue()

    return this
  }

  async _initQueue() {
    try {
      const channel = this._channel
      const { name } = this.props

      const { exchange } = await channel.assertExchange(
        'mb.room',
        'direct',
        {
          durable: false,
          autoDelete: true
        }
      )

      const { queue } = await channel.assertQueue(
        `mb.${name}`,
        {
          durable: false,
          autoDelete: true
        }
      )

      const binding = await channel.bindQueue(
        queue,
        exchange,
        '*'
      )

      const consume = await channel.consume(queue, msg => {

      }, {
        noAck: false
      })

    } catch (e) {
      console.log(e)
    }
  }
}

export default Consumer
