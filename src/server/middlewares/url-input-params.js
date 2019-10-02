import sh from 'shorthash'

import getfileNameAndExt from 'helpers/get-file-name'

export default function parseUrlInputParams(req, res, next) {
  const { id } = req.params
  const fileName = getfileNameAndExt(id)[0].toUpperCase()
  const ext = getfileNameAndExt(id)[1]
  const { project } = req._params
  const { identifier: projectIdentifier } = project
  req._params = {
    ...req._params,
    target: `${ projectIdentifier }/${ fileName }`,
    ext
  }

  next()
}
