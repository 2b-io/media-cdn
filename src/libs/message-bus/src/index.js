import Consumer from './classes/Consumer'
import Producer from './classes/Producer'

export default {
  createConsumer: (props) => new Consumer(props),
  createProducer: (props) => new Producer(props)
}
