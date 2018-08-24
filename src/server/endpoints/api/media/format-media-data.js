import mime from 'mime'
import config from 'infrastructure/config'

const { server: { base } } = config

const formatMediaData = async (s3Object, slug, id) => {
  const { ContentType, Metadata, ContentLength, LastModified } = s3Object
  const originUrl = Metadata[ 'origin-url' ]
  const ext = mime.getExtension(ContentType)
  const origin = `${ slug }/${ id }`
  const hashUrl = ext ?
    `${ base }/s/${ origin }.${ ext }` :
    `${ base }/s/${ origin }`

  return ({
    id: id,
    project: slug,
    contentType: ContentType,
    contentLength: ContentLength,
    lastModified: LastModified,
    path: hashUrl,
    originUrl: originUrl
  })
}

export default formatMediaData
