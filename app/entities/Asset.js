import path from 'path'
import shortHash from 'short-hash'

class Asset {
  constructor(props, state) {
    this.props = { ... props }
    this.state = { tmp: [], ...state }
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

  addTemporaryFile(file) {
    if (!Array.isArray(this.state.tmp)) {
      this.state.tmp = []
    }

    if (!this.state.tmp.includes(file)) {
      this.state.tmp.push(file)
    }
  }
}

export default Asset
