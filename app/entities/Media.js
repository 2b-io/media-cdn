import Asset from './Asset'
import Image from './Image'
import JavaScript from './JavaScript'
import StyleSheet from './StyleSheet'

const create = (props) => {
  return raw(props).generate()
}

const from = (state) => {
  return raw({ type: state.type }, state)
}

const raw = (props, state) => {
  const { type } = props

  switch (type) {
    case 'image':
      return new Image(props, state)

    case 'css':
      return new StyleSheet(props, state)

    case 'javascript':
      return new JavaScript(props, state)

    default:
      return new Asset(props, state)
  }
}

export default {
  create,
  from
}
