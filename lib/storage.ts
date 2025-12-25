import { promises as fs } from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const strategy = process.env.STORAGE_STRATEGY ?? 'local';
const bucket = process.env.S3_BUCKET ?? '';
const s3PublicUrlPrefix = process.env.S3_PUBLIC_URL_PREFIX ?? '';
const localPath = process.env.LOCAL_STORAGE_PATH ?? './uploads';

let s3: S3Client | null = null;
if (strategy === 's3') {
  s3 = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? ''
    }
  });
}

export async function saveFile(name: string, buffer: Buffer, contentType: string) {
  if (strategy === 's3' && s3) {
    const safeName = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `uploads/${Date.now()}-${safeName}`;
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: contentType }));
    if (s3PublicUrlPrefix) return `${s3PublicUrlPrefix.replace(/\/$/, '')}/${key}`;
    return `s3://${bucket}/${key}`;
  }
  const safeName = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `${Date.now()}-${safeName}`;
  const absLocalPath = path.isAbsolute(localPath) ? localPath : path.join(process.cwd(), localPath);
  const target = path.join(absLocalPath, fileName);
  await fs.mkdir(absLocalPath, { recursive: true });
  await fs.writeFile(target, buffer);

  // Si on écrit sous /public, renvoyer une URL exploitable côté front.
  const publicDir = path.join(process.cwd(), 'public');
  const normalizedTarget = path.normalize(target);
  if (normalizedTarget.startsWith(publicDir + path.sep)) {
    const relToPublic = path.relative(publicDir, normalizedTarget).split(path.sep).join('/');
    return `/${relToPublic}`;
  }

  return target;
}

export async function getPresignedUrl(name: string, contentType: string) {
  if (strategy !== 's3' || !s3) return null;
  const safeName = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `uploads/${Date.now()}-${safeName}`;
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  const publicUrl = s3PublicUrlPrefix ? `${s3PublicUrlPrefix.replace(/\/$/, '')}/${key}` : undefined;
  return { url, key, publicUrl };
}
