import s3 from 'infrastructure/s3'

export const getObjects = async (prefix) => {
  return await s3.listObjectsV2({
    Bucket: s3.config.bucket,
    Delimiter: '/',
    Prefix: `${ prefix }/`
  }).promise()
}

export const getObject = async (key) => {
  return await s3.headObject({
    Bucket: s3.config.bucket,
    Key: key
  }).promise()
}

export const deleteObject = async (key) => {
  return await s3.deleteObject({
    Bucket: s3.config.bucket,
    Key: key
  }).promise()
}
