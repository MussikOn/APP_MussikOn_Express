import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '../services/loggerService';

interface AccessToken {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  expiration?: Date;
}

/**
 * Gestor de tokens para IDrive E2
 */
class TokenManager {
  private currentToken: AccessToken | null = null;
  private tokenExpirationBuffer = 5 * 60 * 1000; // 5 minutos antes de expirar

  constructor(
    private accessKeyId: string,
    private secretAccessKey: string,
    private region: string,
    private endpoint: string
  ) {}

  /**
   * Obtiene un token válido, renovándolo si es necesario
   */
  async getValidToken(): Promise<AccessToken> {
    // Si no hay token o está próximo a expirar, renovar
    if (!this.currentToken || this.isTokenExpiringSoon()) {
      await this.refreshToken();
    }
    return this.currentToken!;
  }

  /**
   * Verifica si el token actual está próximo a expirar
   */
  private isTokenExpiringSoon(): boolean {
    if (!this.currentToken?.expiration) return true;
    const now = new Date();
    const expirationTime = this.currentToken.expiration.getTime();
    const bufferTime = now.getTime() + this.tokenExpirationBuffer;
    return bufferTime >= expirationTime;
  }

  /**
   * Renueva el token de acceso
   */
  private async refreshToken(): Promise<void> {
    try {
      logger.info('[functions/src/utils/idriveE2.ts] Renovando token de acceso para IDrive E2');
      // Para IDrive E2, generalmente usamos credenciales permanentes
      // Si necesitas tokens temporales, aquí implementarías la lógica de renovación
      this.currentToken = {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
        expiration: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
      };
      logger.info('[functions/src/utils/idriveE2.ts] Token renovado exitosamente');
    } catch (error) {
      logger.error('[functions/src/utils/idriveE2.ts] Error renovando token:', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Error renovando token de acceso');
    }
  }

  /**
   * Crea un cliente S3 con el token actual
   */
  async createS3Client(): Promise<S3Client> {
    const token = await this.getValidToken();
    return new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: token.accessKeyId,
        secretAccessKey: token.secretAccessKey,
        sessionToken: token.sessionToken,
      },
      forcePathStyle: true,
    });
  }
}

// Instancia global del TokenManager
let tokenManager: TokenManager | null = null;

/**
 * Inicializa el TokenManager
 */
function initializeTokenManager(): TokenManager {
  if (!tokenManager) {
    tokenManager = new TokenManager(
      process.env.IDRIVE_E2_ACCESS_KEY!,
      process.env.IDRIVE_E2_SECRET_KEY!,
      process.env.IDRIVE_E2_REGION!,
      process.env.IDRIVE_E2_ENDPOINT!
    );
  }
  return tokenManager;
}

/**
 * Obtiene un cliente S3 con token válido
 */
export async function getS3Client(): Promise<S3Client> {
  const manager = initializeTokenManager();
  return await manager.createS3Client();
}

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
    const s3Client = await getS3Client();
    const key = `${folder}/${Date.now()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME!,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: 'private',
    });

    await s3Client.send(command);
    
    // Construir URL del archivo
    let fileUrl: string;
    if (process.env.IDRIVE_E2_ENDPOINT?.includes('https://')) {
      fileUrl = `${process.env.IDRIVE_E2_ENDPOINT}/${process.env.IDRIVE_E2_BUCKET_NAME}/${key}`;
    } else {
      fileUrl = `${process.env.IDRIVE_E2_ENDPOINT}/${process.env.IDRIVE_E2_BUCKET_NAME}/${key}`;
    }
    
    logger.info('[functions/src/utils/idriveE2.ts] Archivo subido exitosamente:', {
      metadata: { 
        bucket: process.env.IDRIVE_E2_BUCKET_NAME,
        key,
        url: fileUrl
      }
    });
    
    return fileUrl;
  } catch (error) {
    logger.error('[functions/src/utils/idriveE2.ts] Error al subir archivo a S3:', error instanceof Error ? error : new Error(String(error)));
    throw new Error('Error al subir archivo a S3');
  }
};

/**
 * Descarga un archivo de iDrive E2
 */
export const downloadFromS3 = async (
  key: string
): Promise<Buffer> => {
  try {
    const s3Client = await getS3Client();
    
    const command = new GetObjectCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    
    if (!response.Body) {
      throw new Error('Archivo no encontrado');
    }

    // Convertir stream a buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
    
    return Buffer.concat(chunks);
  } catch (error) {
    logger.error('[functions/src/utils/idriveE2.ts] Error al descargar archivo de S3:', error instanceof Error ? error : new Error(String(error)));
    throw new Error('Error al descargar archivo de S3');
  }
};

/**
 * Elimina un archivo de iDrive E2
 */
export const deleteFromS3 = async (
  key: string
): Promise<boolean> => {
  try {
    const s3Client = await getS3Client();
    
    const command = new DeleteObjectCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    
    logger.info('[functions/src/utils/idriveE2.ts] Archivo eliminado exitosamente:', { metadata: { key } });
    return true;
  } catch (error) {
    logger.error('[functions/src/utils/idriveE2.ts] Error al eliminar archivo de S3:', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
};

/**
 * Verifica si un archivo existe en iDrive E2
 */
export const fileExistsInS3 = async (
  key: string
): Promise<boolean> => {
  try {
    const s3Client = await getS3Client();
    
    const command = new HeadObjectCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Obtiene información de un archivo en iDrive E2
 */
export const getFileInfo = async (
  key: string
): Promise<{
  exists: boolean;
  size?: number;
  lastModified?: Date;
  contentType?: string;
}> => {
  try {
    const s3Client = await getS3Client();
    
    const command = new HeadObjectCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    
    return {
      exists: true,
      size: response.ContentLength,
      lastModified: response.LastModified,
      contentType: response.ContentType,
    };
  } catch (error) {
    return {
      exists: false,
    };
  }
};

/**
 * Genera una URL firmada para acceder a un archivo en iDrive E2
 * Esta función resuelve problemas de CORS y Access Denied
 */
export const generatePresignedUrl = async (
  key: string,
  expiresIn: number = 3600 // 1 hora por defecto
): Promise<string> => {
  try {
    const s3Client = await getS3Client();
    
    const command = new GetObjectCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn 
    });
    
    logger.info('[functions/src/utils/idriveE2.ts] URL firmada generada exitosamente:', {
      metadata: { 
        key,
        expiresIn,
        url: presignedUrl.substring(0, 100) + '...' // Solo mostrar parte de la URL por seguridad
      }
    });
    
    return presignedUrl;
  } catch (error) {
    logger.error('[functions/src/utils/idriveE2.ts] Error al generar URL firmada:', error instanceof Error ? error : new Error(String(error)));
    throw new Error('Error al generar URL firmada');
  }
};

/**
 * Genera una URL firmada para subir un archivo a iDrive E2
 */
export const generatePresignedUploadUrl = async (
  key: string,
  contentType: string,
  expiresIn: number = 3600 // 1 hora por defecto
): Promise<string> => {
  try {
    const s3Client = await getS3Client();
    
    const command = new PutObjectCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn 
    });
    
    logger.info('[functions/src/utils/idriveE2.ts] URL firmada de subida generada exitosamente:', {
      metadata: { 
        key,
        contentType,
        expiresIn,
        url: presignedUrl.substring(0, 100) + '...' // Solo mostrar parte de la URL por seguridad
      }
    });
    
    return presignedUrl;
  } catch (error) {
    logger.error('[functions/src/utils/idriveE2.ts] Error al generar URL firmada de subida:', error instanceof Error ? error : new Error(String(error)));
    throw new Error('Error al generar URL firmada de subida');
  }
};
