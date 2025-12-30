import { promises as fs } from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v2 as cloudinary } from 'cloudinary';

const strategy = process.env.STORAGE_STRATEGY ?? 'local';
const bucket = process.env.S3_BUCKET ?? '';
const s3PublicUrlPrefix = process.env.S3_PUBLIC_URL_PREFIX ?? '';
const localPath = process.env.LOCAL_STORAGE_PATH ?? './uploads';

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME ?? '';
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY ?? '';
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET ?? '';
const cloudinaryFolder = process.env.CLOUDINARY_FOLDER ?? 'location-voiture-saas';

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

if (strategy === 'cloudinary') {
  if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
    throw new Error('Cloudinary: variables manquantes (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)');
  }
  cloudinary.config({
    cloud_name: cloudinaryCloudName,
    api_key: cloudinaryApiKey,
    api_secret: cloudinaryApiSecret,
    secure: true
  });
}

async function uploadToCloudinary(name: string, buffer: Buffer, contentType: string): Promise<string> {
  const safeName = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_');
  const base = safeName.replace(/\.[^.]+$/, '');
  const resourceType = contentType.startsWith('image/') ? 'image' : contentType === 'application/pdf' ? 'raw' : 'auto';

  const res = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: cloudinaryFolder,
        resource_type: resourceType,
        public_id: `${Date.now()}-${base}`,
        overwrite: false
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });

  // Retourner l'URL originale sans transformation de qualité pour conserver 100% de la qualité
  // Les transformations seront appliquées côté affichage si nécessaire
  if (resourceType === 'image' && res?.secure_url) {
    return res.secure_url;
  }

  return res?.secure_url ?? res?.url;
}

export async function saveFile(name: string, buffer: Buffer, contentType: string) {
  if (strategy === 's3' && s3) {
    const safeName = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `uploads/${Date.now()}-${safeName}`;
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: contentType }));
    if (s3PublicUrlPrefix) return `${s3PublicUrlPrefix.replace(/\/$/, '')}/${key}`;
    return `s3://${bucket}/${key}`;
  }

  if (strategy === 'cloudinary') {
    return uploadToCloudinary(name, buffer, contentType);
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
