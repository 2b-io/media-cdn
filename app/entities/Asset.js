import path from 'path'
import shortHash from 'short-hash'

class Asset {
  constructor(props, state) {
    this.props = { ... props }
    this.state = { ...state }
  }

  generate() {
    const { mime, project, src, type } = this.props
    const url = src.toString()

    const uid = `${project.slug}/${shortHash(url)}`
    const ext = path.extname(src.pathname)

    this.state = {
      ...this.state,
      uid, ext, mime, type, url,
      source: `${uid}/source${ext}`
    }

    return this
  }

  toJSON() {
    return this.state
  }

  hash(value) {
    return shortHash(value)
  }
}

export default Asset
