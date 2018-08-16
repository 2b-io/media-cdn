import fs from 'fs-extra'
import path from 'path'
import uuid from 'uuid'

import config from 'infrastructure/config'

export default async (ext) => {
  const today = new Date()
  const localpath = path.join(
    config.tmpDir,
    `${ today.getFullYear() }`,
    `${ today.getMonth() }`,
    uuid.v4()
  )

  await fs.ensureDir(path.dirname(localpath))

  return ext ? `${ localpath }.${ ext }` : localpath
}
