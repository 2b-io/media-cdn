export default class Media {
  static create(props) {
    return new Media(props)
  }

  constructor(props) {
    this.props = props
  }
}
