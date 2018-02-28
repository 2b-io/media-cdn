import Asset from './Asset'

class Image extends Asset {
  generate() {
    super.generate()

    const { uid, ext } = this.state
    const { width, height, mode, preset } = this.props
    const presetValues = this.hash(
      JSON.stringify(preset.values),
      Object.keys(preset.values).sort()
    )

    this.state = {
      ...this.state,
      width, height, mode,
      target: `${uid}/${preset.hash}/${presetValues}/${mode}_${width}x${height}${ext}`,
      quality: preset.values.quality
    }

    return this
  }
}

export default Image
