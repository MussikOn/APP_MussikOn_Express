import { uploadToS3 } from '../utils/idriveE2';
import { logger } from './loggerService';
import { db } from '../utils/firebase';

export interface ImageUploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  metadata?: Record<string, any>;
}

export interface ImageValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ImageService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
  ];

  /**
   * Validar archivo de imagen
   */
  validateImageFile(file: Express.Multer.File): ImageValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!file) {
      errors.push('No se proporcionó archivo');
      return { isValid: false, errors, warnings };
    }

    // Validar tamaño
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`El archivo es demasiado grande. Máximo ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Validar tipo MIME
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      errors.push('Tipo de archivo no permitido. Solo imágenes y PDFs');
    }

    // Validar que el buffer no esté vacío
    if (!file.buffer || file.buffer.length === 0) {
      errors.push('El archivo está vacío');
    }

    // Advertencias
    if (file.size > 5 * 1024 * 1024) { // 5MB
      warnings.push('El archivo es grande, puede tardar en subirse');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Generar nombre único para archivo
   */
  generateUniqueFileName(
    originalName: string, 
    userId: string, 
    folder: string = 'uploads'
  ): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    return `${folder}/${userId}/${timestamp}_${randomSuffix}_${sanitizedName}`;
  }

  /**
   * Subir imagen con manejo mejorado de errores
   */
  async uploadImage(
    file: Express.Multer.File,
    userId: string,
    folder: string = 'uploads',
    metadata?: Record<string, any>
  ): Promise<ImageUploadResult> {
    try {
      // Validar archivo
      const validation = this.validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(`Error de validación: ${validation.errors.join(', ')}`);
      }

      // Generar nombre único
      const uniqueFileName = this.generateUniqueFileName(
        file.originalname || 'image.jpg',
        userId,
        folder
      );

      logger.info('Subiendo imagen', { 
        metadata: { 
          userId, 
          filename: uniqueFileName, 
          size: file.size,
          mimeType: file.mimetype,
          warnings: validation.warnings
        } 
      });

      // Subir a S3
      const fileUrl = await uploadToS3(
        file.buffer,
        uniqueFileName,
        file.mimetype,
        folder
      );

      // Crear registro en base de datos para tracking
      const imageRecord = {
        url: fileUrl,
        filename: uniqueFileName,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        userId,
        folder,
        metadata,
        uploadedAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        accessCount: 0
      };

      const imageId = `img_${Date.now()}_${userId}`;
      await db.collection('image_uploads').doc(imageId).set(imageRecord);

      logger.info('Imagen subida exitosamente', { 
        metadata: { 
          imageId, 
          url: fileUrl, 
          userId 
        } 
      });

      return {
        url: fileUrl,
        filename: uniqueFileName,
        size: file.size,
        mimeType: file.mimetype,
        uploadedAt: imageRecord.uploadedAt,
        metadata
      };

    } catch (error) {
      logger.error('Error subiendo imagen', error as Error, { 
        metadata: { userId, filename: file?.originalname } 
      });
      throw new Error('Error subiendo imagen. Intente nuevamente.');
    }
  }

  /**
   * Obtener imagen con cache y tracking
   */
  async getImage(imageId: string): Promise<ImageUploadResult | null> {
    try {
      const imageDoc = await db.collection('image_uploads').doc(imageId).get();
      
      if (!imageDoc.exists) {
        logger.warn('Imagen no encontrada', { metadata: { imageId } });
        return null;
      }

      const imageData = imageDoc.data() as any;

      // Actualizar contador de acceso
      await db.collection('image_uploads').doc(imageId).update({
        lastAccessed: new Date().toISOString(),
        accessCount: (imageData.accessCount || 0) + 1
      });

      return {
        url: imageData.url,
        filename: imageData.filename,
        size: imageData.size,
        mimeType: imageData.mimeType,
        uploadedAt: imageData.uploadedAt,
        metadata: imageData.metadata
      };

    } catch (error) {
      logger.error('Error obteniendo imagen', error as Error, { metadata: { imageId } });
      throw new Error('Error obteniendo imagen');
    }
  }

  /**
   * Obtener imagen por URL
   */
  async getImageByUrl(url: string): Promise<ImageUploadResult | null> {
    try {
      const imageSnapshot = await db.collection('image_uploads')
        .where('url', '==', url)
        .limit(1)
        .get();

      if (imageSnapshot.empty) {
        logger.warn('Imagen no encontrada por URL', { metadata: { url } });
        return null;
      }

      const imageDoc = imageSnapshot.docs[0];
      const imageData = imageDoc.data() as any;

      // Actualizar contador de acceso
      await db.collection('image_uploads').doc(imageDoc.id).update({
        lastAccessed: new Date().toISOString(),
        accessCount: (imageData.accessCount || 0) + 1
      });

      return {
        url: imageData.url,
        filename: imageData.filename,
        size: imageData.size,
        mimeType: imageData.mimeType,
        uploadedAt: imageData.uploadedAt,
        metadata: imageData.metadata
      };

    } catch (error) {
      logger.error('Error obteniendo imagen por URL', error as Error, { metadata: { url } });
      throw new Error('Error obteniendo imagen por URL');
    }
  }

  /**
   * Eliminar imagen
   */
  async deleteImage(imageId: string): Promise<boolean> {
    try {
      const imageDoc = await db.collection('image_uploads').doc(imageId).get();
      
      if (!imageDoc.exists) {
        logger.warn('Imagen no encontrada para eliminar', { metadata: { imageId } });
        return false;
      }

      const imageData = imageDoc.data() as any;

      // Eliminar de S3 (implementar si es necesario)
      // await deleteFromS3(imageData.filename);

      // Eliminar de base de datos
      await db.collection('image_uploads').doc(imageId).delete();

      logger.info('Imagen eliminada exitosamente', { metadata: { imageId } });
      return true;

    } catch (error) {
      logger.error('Error eliminando imagen', error as Error, { metadata: { imageId } });
      throw new Error('Error eliminando imagen');
    }
  }

  /**
   * Obtener estadísticas de imágenes
   */
  async getImageStatistics(userId?: string): Promise<{
    totalImages: number;
    totalSize: number;
    averageSize: number;
    mostUsedMimeTypes: Record<string, number>;
    recentUploads: number;
  }> {
    try {
      let query: any = db.collection('image_uploads');
      
      if (userId) {
        query = query.where('userId', '==', userId);
      }

      const imagesSnapshot = await query.get();
      const images = imagesSnapshot.docs.map((doc: any) => doc.data() as any);

      const totalImages = images.length;
      const totalSize = images.reduce((sum: number, img: any) => sum + (img.size || 0), 0);
      const averageSize = totalImages > 0 ? totalSize / totalImages : 0;

      // Contar tipos MIME más usados
      const mimeTypeCount: Record<string, number> = {};
      images.forEach((img: any) => {
        const mimeType = img.mimeType || 'unknown';
        mimeTypeCount[mimeType] = (mimeTypeCount[mimeType] || 0) + 1;
      });

      // Contar uploads recientes (últimas 24 horas)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const recentUploads = images.filter((img: any) => 
        new Date(img.uploadedAt) > new Date(oneDayAgo)
      ).length;

      return {
        totalImages,
        totalSize,
        averageSize,
        mostUsedMimeTypes: mimeTypeCount,
        recentUploads
      };

    } catch (error) {
      logger.error('Error obteniendo estadísticas de imágenes', error as Error);
      throw new Error('Error obteniendo estadísticas de imágenes');
    }
  }

  /**
   * Limpiar imágenes antiguas no utilizadas
   */
  async cleanupUnusedImages(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString();
      
      const unusedImagesSnapshot = await db.collection('image_uploads')
        .where('lastAccessed', '<', cutoffDate)
        .where('accessCount', '==', 0)
        .get();

      const deletedCount = unusedImagesSnapshot.size;

      // Eliminar en lotes
      const batch = db.batch();
      unusedImagesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      logger.info('Limpieza de imágenes completada', { 
        metadata: { deletedCount, daysOld } 
      });

      return deletedCount;

    } catch (error) {
      logger.error('Error en limpieza de imágenes', error as Error);
      throw new Error('Error en limpieza de imágenes');
    }
  }

  /**
   * Verificar integridad de imagen
   */
  async verifyImageIntegrity(imageId: string): Promise<{
    exists: boolean;
    accessible: boolean;
    size: number;
    lastAccessed: string;
    accessCount: number;
  }> {
    try {
      const imageDoc = await db.collection('image_uploads').doc(imageId).get();
      
      if (!imageDoc.exists) {
        return {
          exists: false,
          accessible: false,
          size: 0,
          lastAccessed: '',
          accessCount: 0
        };
      }

      const imageData = imageDoc.data() as any;

      // Verificar si la URL es accesible
      let accessible = false;
      try {
        const response = await fetch(imageData.url, { method: 'HEAD' });
        accessible = response.ok;
      } catch (fetchError) {
        logger.warn('Error verificando accesibilidad de imagen', { 
          error: fetchError as Error,
          metadata: {
            imageId, 
            url: imageData.url 
          }
        });
      }

      return {
        exists: true,
        accessible,
        size: imageData.size || 0,
        lastAccessed: imageData.lastAccessed || '',
        accessCount: imageData.accessCount || 0
      };

    } catch (error) {
      logger.error('Error verificando integridad de imagen', error as Error, { metadata: { imageId } });
      throw new Error('Error verificando integridad de imagen');
    }
  }
}

// Instancia singleton
export const imageService = new ImageService();
