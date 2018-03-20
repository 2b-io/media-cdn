import path from 'path'
import { URL } from 'url'

import config from 'infrastructure/config'

import clear from './clear'

export default (req, res, next) => {
  const { _media: media } = req

  const target = path.join(config.tmpDir, media.state.target || media.state.source)
  const filename = `${media.state.url.split('/').pop()}${media.state.ext}`
  const { ext, source } = media.state

  const regex = new RegExp(`/source${ext}$`)

  if (req._args.store) {
    return res.json({
      source: source &&
        new URL(
          `s/${source.replace(regex, ext)}`,
          config.server.url
        ).toString(),
      target: media.state.target &&
        new URL(
          `s/${media.state.target}`,
          config.server.url
        ).toString()
    })
  }

  res.set('content-type', media.state.mime)
  res.set('cache-control', 'public, max-age=2592000')
  res.set('content-disposition', `inline; filename=${filename}`)
  res.sendFile(target)

  res.on('finish', () => clear(req, res, next))
}
