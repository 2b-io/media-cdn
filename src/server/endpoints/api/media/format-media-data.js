import mime from 'mime'
import config from 'infrastructure/config'

const { server: { base } } = config

const formatMediaData = async (s3Object, slug, key) => {
  const { ContentType, Metadata, ContentLength, LastModified } = s3Object
  const originUrl = Metadata[ 'origin-url' ]
  const ext = mime.getExtension(ContentType)
  const origin = `${ slug }/${ key }`
  const hashUrl = ext ?
    `${ base }/s/${ origin }.${ ext }` :
    `${ base }/s/${ origin }`

  return ({
    id: key,
    project: slug,
    contentType: ContentType,
    contentLength: ContentLength,
    lastModified: LastModified,
    path: hashUrl,
    originUrl
  })
}

export default formatMediaData
