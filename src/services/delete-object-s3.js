import s3 from 'infrastructure/s3'
import config from 'infrastructure/config'

// use   deleteObjectS3('0.1-cuongtv/project-1/Z2uj8hT')

const deleteObjectS3 = async (part) => {

  const listParams = {
    Bucket: config.aws.s3.bucket,
    Prefix: part
  }

  const listedObjects = await s3.listObjectsV2(listParams).promise()
  if (listedObjects.Contents.length === 0) return

  const deleteParams = {
    Bucket: config.aws.s3.bucket,
    Delete: { Objects: [] }
  }

  listedObjects.Contents.forEach(({ Key }) => {
    deleteParams.Delete.Objects.push({ Key })
  })

  return await s3.deleteObjects(deleteParams).promise()
}

export default deleteObjectS3
