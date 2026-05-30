import { config } from '../config/index.js';
import crypto from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Stores an uploaded report. PHI: encrypted-at-rest in S3 (KMS) in production;
 * local disk in MOCK_MODE for development only (never commit these files).
 *
 * @returns {Promise<{storageKey:string, location:string}>}
 */
export async function storeReport(buffer, { userId, mimetype }) {
  const ext = mimetype === 'application/pdf' ? 'pdf' : 'img';
  const key = `reports/${userId}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;

  if (config.mockMode) {
    const dir = path.join(process.cwd(), 'uploads', userId);
    await mkdir(dir, { recursive: true });
    const local = path.join(dir, path.basename(key));
    await writeFile(local, buffer);
    return { storageKey: key, location: `file://${local}` };
  }

  // ── Live: S3 with server-side KMS encryption ──
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
  const s3 = new S3Client({ region: config.aws.region });
  await s3.send(
    new PutObjectCommand({
      Bucket: config.aws.s3Bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      ServerSideEncryption: 'aws:kms',
    })
  );
  return { storageKey: key, location: `s3://${config.aws.s3Bucket}/${key}` };
}
