import Asset from './Asset'

class StyleSheet extends Asset {
  generate() {
    super.generate()

    const { uid, ext } = this.state

    this.state = {
      ...this.state,
      target: `${uid}/target${ext}`
    }

    return this
  }
}

export default StyleSheet
