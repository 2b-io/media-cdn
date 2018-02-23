import path from 'path'
import pick from 'object.pick'
import shortHash from 'short-hash'
import config from 'infrastructure/config'

export default class Media {
  static create(props) {
    const media = new Media(props)

    return media._generate()
  }

  static from(props) {
    return new Media(props)
  }

  constructor(props) {
    this.props = props
  }

  _generate() {
    const { project, src, preset, width } = this.props
    const ext = path.extname(src)
    const presetValuesHash = shortHash(JSON.stringify(preset.values), Object.keys(preset.values).sort())

    this.props.uid = `${project.slug}/${shortHash(src)}`

    // original
    this.props.localOriginal = `${config.tmpDir}/${this.props.uid}/original${ext}`
    this.props.remoteOriginal = `media/${this.props.uid}/original${ext}`

    // target
    this.props.localTarget = `${config.tmpDir}/${this.props.uid}/${preset.hash}/${presetValuesHash}/${width}${ext}`
    this.props.remoteTarget = `media/${this.props.uid}/${preset.hash}/${presetValuesHash}/${width}${ext}`

    return this
  }

  toJSON() {
    return pick(this.props, [
      'uid',
      'localOriginal',
      'localTarget',
      'remoteOriginal',
      'remoteTarget',
      'src',
      'width'
    ])
  }
}
