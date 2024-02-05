// 用 aws s3 sdk 上傳檔案到 linode storage
import { Upload } from '@aws-sdk/lib-storage'
import { S3Client } from '@aws-sdk/client-s3'

export default async function (body, path, fileName) {
  const client = new S3Client({
      credentials: {
        accessKeyId: process.env.LINODE_OBJECT_STORAGE_ACCESS_KEY_ID,
        secretAccessKey: process.env.LINODE_OBJECT_STORAGE_SECRET_ACCESS_KEY
      },
      region: process.env.LINODE_OBJECT_STORAGE_REGION,
      endpoint: process.env.LINODE_OBJECT_STORAGE_ENDPOINT,
      sslEnabled: true,
      s3ForcePathStyle: false
  })

  const params = {
    Bucket: process.env.LINODE_OBJECT_BUCKET,
    Key: `${path}/${fileName}`,
    Body: body,
    ACL: 'public-read'
  }

  try {
    const result = await new Upload({ client, params }).done()
    return result.Location.replace('.jp-osa-1.linodeobjects.com', '')
  } catch (err) {
    return false
  }
}
