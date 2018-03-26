import kue from 'kue'

class Producer {
  static create(props) {
    return new Producer(props)
  }

  constructor(props) {
    this._kue = kue.createQueue(props)
  }

  discover(done, interval = 1000) {
    done()
  }
}

export default Producer
