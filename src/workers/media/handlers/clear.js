import parallel from 'async/parallel'
import reflect from 'async/reflect'
import fs from 'fs'
import path from 'path'

import config from 'infrastructure/config'
import Media from 'entities/Media'

export default async (data, rpc) => {
  const media = Media.from(data.media)

  await new Promise((resolve, reject) => {
    parallel(
      media.state.tmp.map(
        f => reflect(
          done => fs.unlink(path.join(config.tmpDir, f), done)
        )
      ),
      error => {
        resolve()
      }
    )
  })

  return {
    succeed: true,
    media
  }
}
