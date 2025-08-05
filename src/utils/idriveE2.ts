import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '../services/loggerService';

// Interfaz para el token de acceso
interface AccessToken {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  expiration?: Date;
}

// Clase para manejar la renovación automática de tokens
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
      logger.info('[src/utils/idriveE2.ts] Renovando token de acceso para IDrive E2');
      
      // Para IDrive E2, generalmente usamos credenciales permanentes
      // Si necesitas tokens temporales, aquí implementarías la lógica de renovación
      this.currentToken = {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
        expiration: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
      };

      logger.info('[src/utils/idriveE2.ts] Token renovado exitosamente');
    } catch (error) {
      logger.error('[src/utils/idriveE2.ts] Error renovando token:', error instanceof Error ? error : new Error(String(error)));
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

// Instancia global del administrador de tokens
let tokenManager: TokenManager | null = null;

/**
 * Inicializa el administrador de tokens
 */
function initializeTokenManager(): TokenManager {
  if (!tokenManager) {
    const accessKeyId = process.env.IDRIVE_E2_ACCESS_KEY;
    const secretAccessKey = process.env.IDRIVE_E2_SECRET_KEY;
    const region = process.env.IDRIVE_E2_REGION;
    const endpoint = process.env.IDRIVE_E2_ENDPOINT;

    if (!accessKeyId || !secretAccessKey || !region || !endpoint) {
      throw new Error('Variables de entorno de IDrive E2 no configuradas correctamente');
    }

    tokenManager = new TokenManager(accessKeyId, secretAccessKey, region, endpoint);
    logger.info('[src/utils/idriveE2.ts] Administrador de tokens inicializado');
  }

  return tokenManager;
}

/**
 * Obtiene un cliente S3 válido con token renovado
 */
export async function getS3Client(): Promise<S3Client> {
  const manager = initializeTokenManager();
  return await manager.createS3Client();
}

/**
 * Genera una URL correcta para IDrive E2
 */
function generateCorrectUrl(bucketName: string, key: string): string {
  const endpoint = process.env.IDRIVE_E2_ENDPOINT;
  
  if (!endpoint) {
    throw new Error('IDRIVE_E2_ENDPOINT no configurado');
  }

  // Para IDrive E2, usar el formato específico del endpoint
  if (endpoint.includes('idrivee2')) {
    // Formato específico de IDrive E2
    return `${endpoint}/${bucketName}/${key}`;
  } else if (endpoint.includes('amazonaws.com')) {
    // Formato estándar de AWS S3
    return `https://${bucketName}.s3.${process.env.IDRIVE_E2_REGION}.amazonaws.com/${key}`;
  } else {
    // Formato genérico para otros proveedores S3
    return `${endpoint}/${bucketName}/${key}`;
  }
}

/**
 * Sube un archivo a iDrive E2 (S3) con manejo automático de tokens y configuración mejorada
 */
export const uploadToS3 = async (
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'uploads'
): Promise<string> => {
  try {
    // Validar variables de entorno
    if (!process.env.IDRIVE_E2_BUCKET_NAME || !process.env.IDRIVE_E2_ENDPOINT) {
      throw new Error('Variables de entorno de iDrive E2 no configuradas');
    }

    const key = `${folder}/${Date.now()}-${fileName}`;
    
    // Obtener cliente S3 con token renovado
    const s3Client = await getS3Client();
    
    const command = new PutObjectCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read', // Configurar como público para acceso directo
      CacheControl: 'public, max-age=3600', // Cache por 1 hora
    });

    await s3Client.send(command);
    
    // Generar URL correcta para IDrive E2
    const fileUrl = generateCorrectUrl(process.env.IDRIVE_E2_BUCKET_NAME, key);
    
    logger.info('[src/utils/idriveE2.ts] Archivo subido exitosamente:', {
      metadata: { 
        bucket: process.env.IDRIVE_E2_BUCKET_NAME,
        key,
        url: fileUrl,
        contentType,
        size: file.length
      }
    });
    
    return fileUrl;
  } catch (error) {
    logger.error('[src/utils/idriveE2.ts] Error al subir archivo a S3:', error instanceof Error ? error : new Error(String(error)));
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
    logger.error('[src/utils/idriveE2.ts] Error al descargar archivo de S3:', error instanceof Error ? error : new Error(String(error)));
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
    
    logger.info('[src/utils/idriveE2.ts] Archivo eliminado exitosamente:', { metadata: { key } });
    return true;
  } catch (error) {
    logger.error('[src/utils/idriveE2.ts] Error al eliminar archivo de S3:', error instanceof Error ? error : new Error(String(error)));
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
    
    logger.info('[src/utils/idriveE2.ts] URL firmada generada exitosamente:', {
      metadata: { 
        key,
        expiresIn,
        url: presignedUrl.substring(0, 100) + '...' // Solo mostrar parte de la URL por seguridad
      }
    });
    
    return presignedUrl;
  } catch (error) {
    logger.error('[src/utils/idriveE2.ts] Error al generar URL firmada:', error instanceof Error ? error : new Error(String(error)));
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
    
    logger.info('[src/utils/idriveE2.ts] URL firmada de subida generada exitosamente:', {
      metadata: { 
        key,
        contentType,
        expiresIn,
        url: presignedUrl.substring(0, 100) + '...' // Solo mostrar parte de la URL por seguridad
      }
    });
    
    return presignedUrl;
  } catch (error) {
    logger.error('[src/utils/idriveE2.ts] Error al generar URL firmada de subida:', error instanceof Error ? error : new Error(String(error)));
    throw new Error('Error al generar URL firmada de subida');
  }
};

/**
 * Obtiene una imagen desde S3 y la devuelve como buffer
 * Función mejorada para servir imágenes directamente
 */
export const getImageFromS3 = async (key: string): Promise<{
  buffer: Buffer;
  contentType: string;
  size: number;
}> => {
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
    
    const buffer = Buffer.concat(chunks);
    const contentType = response.ContentType || 'image/jpeg';
    const size = response.ContentLength || buffer.length;

    logger.info('[src/utils/idriveE2.ts] Imagen obtenida exitosamente desde S3:', {
      metadata: { 
        key,
        contentType,
        size,
        bucket: process.env.IDRIVE_E2_BUCKET_NAME
      }
    });

    return {
      buffer,
      contentType,
      size
    };
  } catch (error) {
    logger.error('[src/utils/idriveE2.ts] Error obteniendo imagen desde S3:', error instanceof Error ? error : new Error(String(error)));
    throw new Error('Error obteniendo imagen desde S3');
  }
};

/**
 * Extrae la clave del archivo desde una URL de S3
 */
export const extractKeyFromUrl = (url: string): string | null => {
  try {
    const bucketName = process.env.IDRIVE_E2_BUCKET_NAME;
    if (!bucketName) return null;

    // Buscar la clave después del nombre del bucket
    const bucketIndex = url.indexOf(bucketName);
    if (bucketIndex === -1) return null;

    const keyStart = bucketIndex + bucketName.length + 1; // +1 para el slash
    return url.substring(keyStart);
  } catch (error) {
    logger.error('[src/utils/idriveE2.ts] Error extrayendo clave de URL:', error instanceof Error ? error : new Error(String(error)));
    return null;
  }
};

// Cliente S3 legacy para compatibilidad (deprecated)
export const s3 = new S3Client({
  region: process.env.IDRIVE_E2_REGION,
  endpoint: process.env.IDRIVE_E2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.IDRIVE_E2_ACCESS_KEY!,
    secretAccessKey: process.env.IDRIVE_E2_SECRET_KEY!,
  },
  forcePathStyle: true,
});
