import { uploadToS3, generatePresignedUrl, listImagesWithSignedUrls } from '../utils/idriveE2';
import { logger } from './loggerService';
import { db } from '../utils/firebase';

export interface ImageUploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  urlExpiresAt?: string;
  lastUrlUpdate?: string;
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
    'image/svg+xml',
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
        return null;
      }

      const imageDoc = imageSnapshot.docs[0];
      const imageData = imageDoc.data() as any;

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
   * Obtener todas las imágenes con filtros
   */
  async getAllImages(filters?: {
    category?: string;
    isPublic?: boolean;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<any[]> {
    try {
      let query: any = db.collection('image_uploads');

      // Aplicar filtros
      if (filters?.category) {
        query = query.where('category', '==', filters.category);
      }

      if (filters?.isPublic !== undefined) {
        query = query.where('isPublic', '==', filters.isPublic);
      }

      if (filters?.isActive !== undefined) {
        query = query.where('isActive', '==', filters.isActive);
      }

      // Aplicar paginación
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const offset = (page - 1) * limit;

      query = query.limit(limit).offset(offset);

      const imagesSnapshot = await query.get();
      const images: any[] = [];

      imagesSnapshot.forEach((doc: any) => {
        const imageData = doc.data();
        const image = {
          id: doc.id,
          ...imageData
        };

        // Aplicar filtro de búsqueda si existe
        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase();
          const description = imageData.description?.toLowerCase() || '';
          const filename = imageData.filename?.toLowerCase() || '';
          const tags = imageData.tags?.join(' ').toLowerCase() || '';

          if (description.includes(searchTerm) || 
              filename.includes(searchTerm) || 
              tags.includes(searchTerm)) {
            images.push(image);
          }
        } else {
          images.push(image);
        }
      });

      return images;

    } catch (error) {
      logger.error('Error obteniendo imágenes', error as Error);
      throw new Error('Error obteniendo imágenes');
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
    imagesByCategory: Record<string, number>;
    imagesByUser: Record<string, number>;
    publicImages: number;
    privateImages: number;
    activeImages: number;
    inactiveImages: number;
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

      // Contar por categoría
      const imagesByCategory: Record<string, number> = {};
      images.forEach((img: any) => {
        const category = img.category || 'other';
        imagesByCategory[category] = (imagesByCategory[category] || 0) + 1;
      });

      // Contar por usuario
      const imagesByUser: Record<string, number> = {};
      images.forEach((img: any) => {
        const user = img.userId || 'unknown';
        imagesByUser[user] = (imagesByUser[user] || 0) + 1;
      });

      // Contar públicas vs privadas
      const publicImages = images.filter((img: any) => img.isPublic === true).length;
      const privateImages = totalImages - publicImages;

      // Contar activas vs inactivas
      const activeImages = images.filter((img: any) => img.isActive !== false).length;
      const inactiveImages = totalImages - activeImages;

      return {
        totalImages,
        totalSize,
        imagesByCategory,
        imagesByUser,
        publicImages,
        privateImages,
        activeImages,
        inactiveImages
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

  /**
   * Obtener todas las imágenes con URLs firmadas de IDrive E2
   */
  async getAllImagesWithSignedUrls(filters?: {
    category?: string;
    isPublic?: boolean;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<any[]> {
    try {
      logger.info('[src/services/imageService.ts] Obteniendo imágenes con URLs firmadas', { 
        metadata: { filters } 
      });

      // Obtener imágenes de la base de datos
      const images = await this.getAllImages(filters);
      
      // Generar URLs firmadas para cada imagen
      const imagesWithSignedUrls = await Promise.all(
        images.map(async (image) => {
          try {
            // Extraer la clave del archivo de la URL o usar el filename
            let fileKey = image.filename || image.url;
            
            // Si la URL contiene la clave completa, extraerla
            if (image.url && image.url.includes('/')) {
              const urlParts = image.url.split('/');
              fileKey = urlParts[urlParts.length - 1];
            }

            // Generar URL firmada válida por 1 hora
            const signedUrl = await generatePresignedUrl(fileKey, 3600);
            
            logger.info('[src/services/imageService.ts] URL firmada generada', { 
              metadata: { 
                imageId: image.id, 
                filename: image.filename,
                originalUrl: image.url,
                signedUrl: signedUrl.substring(0, 50) + '...' // Solo mostrar parte de la URL por seguridad
              } 
            });

            return {
              ...image,
              url: signedUrl, // Reemplazar con URL firmada
              originalUrl: image.url // Mantener URL original como referencia
            };
          } catch (error) {
            logger.error('[src/services/imageService.ts] Error generando URL firmada', error as Error, { 
              metadata: { 
                imageId: image.id, 
                filename: image.filename 
              } 
            });
            
            // Retornar imagen con URL original si falla la generación de URL firmada
            return {
              ...image,
              url: image.url,
              signedUrlError: true
            };
          }
        })
      );

      logger.info('[src/services/imageService.ts] Imágenes con URLs firmadas obtenidas', { 
        metadata: { 
          totalImages: imagesWithSignedUrls.length,
          imagesWithErrors: imagesWithSignedUrls.filter(img => img.signedUrlError).length
        } 
      });

      return imagesWithSignedUrls;

    } catch (error) {
      logger.error('[src/services/imageService.ts] Error obteniendo imágenes con URLs firmadas', error as Error);
      throw new Error('Error obteniendo imágenes con URLs firmadas');
    }
  }

  /**
   * Obtener todas las imágenes directamente desde IDrive E2 con URLs firmadas
   */
  async getAllImagesFromIDriveE2(filters?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<any[]> {
    try {
      logger.info('[src/services/imageService.ts] Obteniendo imágenes directamente desde IDrive E2', { 
        metadata: { filters } 
      });

      // Determinar el prefijo basado en la categoría
      let prefix: string | undefined;
      if (filters?.category) {
        switch (filters.category.toLowerCase()) {
          case 'profile':
            prefix = 'musikon-media/profile/';
            break;
          case 'event':
            prefix = 'musikon-media/post/';
            break;
          case 'voucher':
            prefix = 'musikon-media/deposits/';
            break;
          case 'gallery':
            prefix = 'musikon-media/gallery/';
            break;
          default:
            prefix = `musikon-media/${filters.category}/`;
        }
      } else {
        // Si no hay categoría específica, buscar en todo el bucket
        prefix = 'musikon-media/';
      }

      // Obtener imágenes directamente desde IDrive E2
      const images = await listImagesWithSignedUrls(prefix, filters?.limit || 1000);

      // Aplicar filtro de búsqueda si existe
      let filteredImages = images;
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredImages = images.filter(img => 
          img.filename.toLowerCase().includes(searchTerm) ||
          img.category?.toLowerCase().includes(searchTerm)
        );
      }

      // Aplicar paginación
      if (filters?.page && filters?.limit) {
        const startIndex = (filters.page - 1) * filters.limit;
        const endIndex = startIndex + filters.limit;
        filteredImages = filteredImages.slice(startIndex, endIndex);
      }

      // Formatear respuesta para compatibilidad con el frontend
      const formattedImages = filteredImages.map((img, index) => ({
        id: `idrive_${index}_${Date.now()}`, // ID temporal
        filename: img.filename,
        url: img.url,
        size: img.size,
        uploadedAt: img.lastModified.toISOString(),
        category: img.category || 'general',
        isPublic: true,
        isActive: true,
        mimeType: this.getMimeTypeFromFilename(img.filename),
        metadata: {
          key: img.key,
          lastModified: img.lastModified,
          category: img.category
        }
      }));

      logger.info('[src/services/imageService.ts] Imágenes obtenidas desde IDrive E2', { 
        metadata: { 
          totalImages: formattedImages.length,
          prefix,
          filters
        } 
      });

      return formattedImages;

    } catch (error) {
      logger.error('[src/services/imageService.ts] Error obteniendo imágenes desde IDrive E2', error as Error);
      throw new Error('Error obteniendo imágenes desde IDrive E2');
    }
  }

  /**
   * Obtener una sola imagen específica desde IDrive E2
   */
  async getSingleImageFromIDriveE2(imageKey: string): Promise<{
    id: string;
    filename: string;
    url: string;
    size: number;
    uploadedAt: string;
    category: string;
    isPublic: boolean;
    isActive: boolean;
    mimeType: string;
    metadata: {
      key: string;
      lastModified: string;
      category: string;
    };
  } | null> {
    try {
      logger.info(`[src/services/imageService.ts] Obteniendo imagen individual desde IDrive E2: ${imageKey}`);
      
      // Importar las funciones necesarias
      const { generatePresignedUrl, getFileInfo } = await import('../utils/idriveE2');
      
      // Verificar si el archivo existe
      const fileInfo = await getFileInfo(imageKey);
      
      if (!fileInfo.exists) {
        logger.warn(`[src/services/imageService.ts] Imagen no encontrada en IDrive E2: ${imageKey}`);
        return null;
      }
      
      // Generar URL firmada
      const signedUrl = await generatePresignedUrl(imageKey, 3600); // 1 hora
      
      // Extraer información del archivo
      const pathParts = imageKey.split('/');
      const filename = pathParts[pathParts.length - 1];
      
      // Determinar categoría basada en la ruta
      let category = 'general';
      if (pathParts.length > 2 && pathParts[0] === 'musikon-media') {
        category = pathParts[1]; // deposits, profile, post, gallery, etc.
      }
      
      // Determinar tipo MIME
      const mimeType = this.getMimeTypeFromFilename(filename);
      
      // Crear ID único
      const id = `idrive_single_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      
      const imageData = {
        id,
        filename,
        url: signedUrl,
        size: fileInfo.size || 0,
        uploadedAt: fileInfo.lastModified?.toISOString() || new Date().toISOString(),
        category,
        isPublic: true,
        isActive: true,
        mimeType,
        metadata: {
          key: imageKey,
          lastModified: fileInfo.lastModified?.toISOString() || new Date().toISOString(),
          category
        }
      };
      
      logger.info(`[src/services/imageService.ts] Imagen obtenida exitosamente: ${filename}`);
      return imageData;
      
    } catch (error) {
      logger.error(`[src/services/imageService.ts] Error obteniendo imagen individual desde IDrive E2:`, error instanceof Error ? error : new Error(String(error)));
      throw new Error(`Error obteniendo imagen individual: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Obtener imagen por nombre de archivo desde IDrive E2
   */
  async getImageByFilenameFromIDriveE2(filename: string, category?: string): Promise<{
    id: string;
    filename: string;
    url: string;
    size: number;
    uploadedAt: string;
    category: string;
    isPublic: boolean;
    isActive: boolean;
    mimeType: string;
    metadata: {
      key: string;
      lastModified: string;
      category: string;
    };
  } | null> {
    try {
      logger.info(`[src/services/imageService.ts] Buscando imagen por nombre: ${filename}, categoría: ${category || 'todas'}`);
      
      // Construir el prefijo de búsqueda
      let searchPrefix = 'musikon-media/';
      if (category) {
        searchPrefix += `${category}/`;
      }
      
      // Listar imágenes con el prefijo
      const images = await listImagesWithSignedUrls(searchPrefix, 1000);
      
      // Buscar la imagen por nombre de archivo
      const foundImage = images.find(img => img.filename === filename);
      
      if (!foundImage) {
        logger.warn(`[src/services/imageService.ts] Imagen no encontrada: ${filename}`);
        return null;
      }
      
      // Crear ID único
      const id = `idrive_filename_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      
      const imageData = {
        id,
        filename: foundImage.filename,
        url: foundImage.url,
        size: foundImage.size,
        uploadedAt: foundImage.lastModified.toISOString(),
        category: foundImage.category || 'general',
        isPublic: true,
        isActive: true,
        mimeType: foundImage.contentType || this.getMimeTypeFromFilename(foundImage.filename),
        metadata: {
          key: foundImage.key,
          lastModified: foundImage.lastModified.toISOString(),
          category: foundImage.category || 'general'
        }
      };
      
      logger.info(`[src/services/imageService.ts] Imagen encontrada por nombre: ${filename}`);
      return imageData;
      
    } catch (error) {
      logger.error(`[src/services/imageService.ts] Error buscando imagen por nombre:`, error instanceof Error ? error : new Error(String(error)));
      throw new Error(`Error buscando imagen por nombre: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Obtener el tipo MIME basado en la extensión del archivo
   */
  private getMimeTypeFromFilename(filename: string): string {
    const extension = filename.toLowerCase().split('.').pop();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'svg':
        return 'image/svg+xml';
      default:
        return 'image/jpeg';
    }
  }

  /**
   * Actualizar automáticamente todas las URLs firmadas para garantizar seguridad
   */
  async updateAllSignedUrls(): Promise<{
    totalImages: number;
    updatedImages: number;
    failedImages: number;
    errors: string[];
  }> {
    try {
      logger.info('[src/services/imageService.ts] Iniciando actualización masiva de URLs firmadas');
      
      const result = {
        totalImages: 0,
        updatedImages: 0,
        failedImages: 0,
        errors: [] as string[]
      };

      // Obtener todas las imágenes de la base de datos
      const allImages = await this.getAllImages();
      result.totalImages = allImages.length;

      logger.info(`[src/services/imageService.ts] Procesando ${result.totalImages} imágenes para actualización de URLs`);

      // Procesar cada imagen y actualizar su URL firmada
      const updatePromises = allImages.map(async (image) => {
        try {
          // Extraer la clave del archivo
          let fileKey = image.filename || image.url;
          
          // Si la URL contiene la clave completa, extraerla
          if (image.url && image.url.includes('/')) {
            const urlParts = image.url.split('/');
            fileKey = urlParts[urlParts.length - 1];
          }

          // Generar nueva URL firmada válida por 1 hora
          const newSignedUrl = await generatePresignedUrl(fileKey, 3600);
          
          // Actualizar la imagen en la base de datos con la nueva URL
          await this.updateImageUrl(image.id, newSignedUrl);
          
          result.updatedImages++;
          
          logger.info(`[src/services/imageService.ts] URL actualizada para imagen ${image.id}`, { 
            metadata: { 
              imageId: image.id, 
              filename: image.filename,
              newUrlPreview: newSignedUrl.substring(0, 50) + '...'
            } 
          });

        } catch (error) {
          result.failedImages++;
          const errorMsg = `Error actualizando imagen ${image.id}: ${error instanceof Error ? error.message : String(error)}`;
          result.errors.push(errorMsg);
          
          logger.error(`[src/services/imageService.ts] ${errorMsg}`, error as Error);
        }
      });

      // Esperar a que se completen todas las actualizaciones
      await Promise.all(updatePromises);

      logger.info('[src/services/imageService.ts] Actualización masiva de URLs completada', { 
        metadata: { 
          totalImages: result.totalImages,
          updatedImages: result.updatedImages,
          failedImages: result.failedImages,
          errorCount: result.errors.length
        } 
      });

      return result;

    } catch (error) {
      logger.error('[src/services/imageService.ts] Error en actualización masiva de URLs', error as Error);
      throw new Error('Error actualizando URLs firmadas');
    }
  }

  /**
   * Actualizar URL de una imagen específica en la base de datos
   */
  private async updateImageUrl(imageId: string, newUrl: string): Promise<void> {
    try {
      const imageRef = db.collection('image_uploads').doc(imageId);
      await imageRef.update({
        url: newUrl,
        lastUrlUpdate: new Date().toISOString(),
        urlExpiresAt: new Date(Date.now() + 3600 * 1000).toISOString() // 1 hora
      });
    } catch (error) {
      logger.error(`[src/services/imageService.ts] Error actualizando URL en BD para imagen ${imageId}`, error as Error);
      throw error;
    }
  }

  /**
   * Verificar y renovar URLs firmadas expiradas
   */
  async refreshExpiredSignedUrls(): Promise<{
    checkedImages: number;
    refreshedImages: number;
    expiredImages: number;
    errors: string[];
  }> {
    try {
      logger.info('[src/services/imageService.ts] Verificando URLs firmadas expiradas');
      
      const result = {
        checkedImages: 0,
        refreshedImages: 0,
        expiredImages: 0,
        errors: [] as string[]
      };

      // Obtener todas las imágenes
      const allImages = await this.getAllImages();
      result.checkedImages = allImages.length;

      const now = new Date();

      // Verificar cada imagen
      const refreshPromises = allImages.map(async (image) => {
        try {
          // Verificar si la URL está próxima a expirar (menos de 30 minutos)
          const urlExpiresAt = image.urlExpiresAt ? new Date(image.urlExpiresAt) : null;
          const isExpired = !urlExpiresAt || urlExpiresAt <= now;
          const isExpiringSoon = urlExpiresAt && (urlExpiresAt.getTime() - now.getTime()) < 30 * 60 * 1000; // 30 minutos

          if (isExpired || isExpiringSoon) {
            result.expiredImages++;
            
            // Extraer la clave del archivo
            let fileKey = image.filename || image.url;
            if (image.url && image.url.includes('/')) {
              const urlParts = image.url.split('/');
              fileKey = urlParts[urlParts.length - 1];
            }

            // Generar nueva URL firmada
            const newSignedUrl = await generatePresignedUrl(fileKey, 3600);
            
            // Actualizar en la base de datos
            await this.updateImageUrl(image.id, newSignedUrl);
            
            result.refreshedImages++;
            
            logger.info(`[src/services/imageService.ts] URL renovada para imagen ${image.id}`, { 
              metadata: { 
                imageId: image.id, 
                wasExpired: isExpired,
                wasExpiringSoon: isExpiringSoon
              } 
            });
          }

        } catch (error) {
          const errorMsg = `Error renovando URL para imagen ${image.id}: ${error instanceof Error ? error.message : String(error)}`;
          result.errors.push(errorMsg);
          
          logger.error(`[src/services/imageService.ts] ${errorMsg}`, error as Error);
        }
      });

      await Promise.all(refreshPromises);

      logger.info('[src/services/imageService.ts] Verificación de URLs expiradas completada', { 
        metadata: { 
          checkedImages: result.checkedImages,
          expiredImages: result.expiredImages,
          refreshedImages: result.refreshedImages,
          errorCount: result.errors.length
        } 
      });

      return result;

    } catch (error) {
      logger.error('[src/services/imageService.ts] Error verificando URLs expiradas', error as Error);
      throw new Error('Error verificando URLs firmadas');
    }
  }

  /**
   * Obtener imagen con URL firmada garantizada (siempre actualizada)
   */
  async getImageWithGuaranteedSignedUrl(imageId: string): Promise<ImageUploadResult | null> {
    try {
      logger.info(`[src/services/imageService.ts] Obteniendo imagen con URL firmada garantizada: ${imageId}`);
      
      // Obtener la imagen
      const image = await this.getImage(imageId);
      
      if (!image) {
        logger.warn(`[src/services/imageService.ts] Imagen no encontrada: ${imageId}`);
        return null;
      }

      // Verificar si la URL necesita renovación
      const now = new Date();
      const urlExpiresAt = image.urlExpiresAt ? new Date(image.urlExpiresAt) : null;
      const needsRefresh = !urlExpiresAt || urlExpiresAt <= now || 
                          (urlExpiresAt && (urlExpiresAt.getTime() - now.getTime()) < 30 * 60 * 1000);

      if (needsRefresh) {
        logger.info(`[src/services/imageService.ts] Renovando URL para imagen ${imageId}`);
        
        // Extraer la clave del archivo
        let fileKey = image.filename || image.url;
        if (image.url && image.url.includes('/')) {
          const urlParts = image.url.split('/');
          fileKey = urlParts[urlParts.length - 1];
        }

        // Generar nueva URL firmada
        const newSignedUrl = await generatePresignedUrl(fileKey, 3600);
        
        // Actualizar en la base de datos
        await this.updateImageUrl(imageId, newSignedUrl);
        
        // Retornar imagen con URL actualizada
        return {
          ...image,
          url: newSignedUrl
        };
      }

      // Retornar imagen con URL existente si aún es válida
      return image;

    } catch (error) {
      logger.error(`[src/services/imageService.ts] Error obteniendo imagen con URL garantizada: ${imageId}`, error as Error);
      throw new Error('Error obteniendo imagen con URL firmada');
    }
  }

  /**
   * Obtener múltiples imágenes con URLs firmadas garantizadas
   */
  async getMultipleImagesWithGuaranteedSignedUrls(imageIds: string[]): Promise<{
    images: ImageUploadResult[];
    failedImages: string[];
    errors: string[];
  }> {
    try {
      logger.info(`[src/services/imageService.ts] Obteniendo ${imageIds.length} imágenes con URLs firmadas garantizadas`);
      
      const result = {
        images: [] as ImageUploadResult[],
        failedImages: [] as string[],
        errors: [] as string[]
      };

      // Procesar cada imagen
      const imagePromises = imageIds.map(async (imageId) => {
        try {
          const image = await this.getImageWithGuaranteedSignedUrl(imageId);
          if (image) {
            result.images.push(image);
          } else {
            result.failedImages.push(imageId);
          }
        } catch (error) {
          result.failedImages.push(imageId);
          result.errors.push(`Error procesando imagen ${imageId}: ${error instanceof Error ? error.message : String(error)}`);
        }
      });

      await Promise.all(imagePromises);

      logger.info('[src/services/imageService.ts] Procesamiento de múltiples imágenes completado', { 
        metadata: { 
          requestedImages: imageIds.length,
          successfulImages: result.images.length,
          failedImages: result.failedImages.length,
          errorCount: result.errors.length
        } 
      });

      return result;

    } catch (error) {
      logger.error('[src/services/imageService.ts] Error obteniendo múltiples imágenes con URLs garantizadas', error as Error);
      throw new Error('Error obteniendo múltiples imágenes');
    }
  }
}

// Instancia singleton
export const imageService = new ImageService();
