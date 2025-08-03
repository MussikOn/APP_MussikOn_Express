import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { logger } from '../services/loggerService';

export const s3 = new S3Client({
  region: process.env.IDRIVE_E2_REGION,
  endpoint: process.env.IDRIVE_E2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.IDRIVE_E2_ACCESS_KEY!,
    secretAccessKey: process.env.IDRIVE_E2_SECRET_KEY!,
  },
  forcePathStyle: true,
});

/**
 * Sube un archivo a iDrive E2 (S3)
 */
export const uploadToS3 = async (
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'uploads'
): Promise<string> => {
  try {
    const key = `${folder}/${Date.now()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET!,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: 'private',
    });

    await s3.send(command);
    
    // Retorna la URL del archivo
    return `${process.env.IDRIVE_E2_ENDPOINT}/${process.env.IDRIVE_E2_BUCKET}/${key}`;
  } catch (error) {
    logger.error('[functions/src/utils/idriveE2.ts] Error al subir archivo a S3:', error as Error);
    throw new Error('Error al subir archivo a S3');
  }
};
