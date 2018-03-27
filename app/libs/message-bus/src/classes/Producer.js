import Connection from './Connection'

class Producer extends Connection {
  constructor(props) {
    super(props)
  }

  async discover() {
    await this._connect()

    return this
  }
}

export default Producer
