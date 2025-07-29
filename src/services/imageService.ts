import { Image, ImageFilters } from "../utils/DataTypes";
import { 
  uploadImage, 
  getImageById, 
  listImages, 
  updateImage, 
  deleteImage,
  getUserProfileImages,
  getPostImages,
  getEventImages,
  getImageStats
} from "../models/imagesModel";

/**
 * Servicio para manejo de imágenes
 */
export class ImageService {
  
  /**
   * Subir imagen de perfil
   */
  static async uploadProfileImage(
    file: Express.Multer.File,
    userId: string,
    description?: string
  ): Promise<Image> {
    return await uploadImage(file, userId, 'profile', {
      description: description || 'Foto de perfil',
      tags: ['profile', 'user'],
      isPublic: true
    });
  }

  /**
   * Subir imagen de post
   */
  static async uploadPostImage(
    file: Express.Multer.File,
    userId: string,
    description?: string,
    tags?: string[]
  ): Promise<Image> {
    return await uploadImage(file, userId, 'post', {
      description: description || 'Imagen de post',
      tags: tags || ['post'],
      isPublic: true
    });
  }

  /**
   * Subir imagen de evento
   */
  static async uploadEventImage(
    file: Express.Multer.File,
    userId: string,
    eventId: string,
    description?: string
  ): Promise<Image> {
    return await uploadImage(file, userId, 'event', {
      description: description || 'Imagen de evento',
      tags: ['event', eventId],
      isPublic: true,
      customMetadata: { eventId }
    });
  }

  /**
   * Subir imagen de galería
   */
  static async uploadGalleryImage(
    file: Express.Multer.File,
    userId: string,
    description?: string,
    tags?: string[]
  ): Promise<Image> {
    return await uploadImage(file, userId, 'gallery', {
      description: description || 'Imagen de galería',
      tags: tags || ['gallery'],
      isPublic: true
    });
  }

  /**
   * Subir imagen administrativa
   */
  static async uploadAdminImage(
    file: Express.Multer.File,
    userId: string,
    description?: string,
    tags?: string[]
  ): Promise<Image> {
    return await uploadImage(file, userId, 'admin', {
      description: description || 'Imagen administrativa',
      tags: tags || ['admin'],
      isPublic: false
    });
  }

  /**
   * Obtener imagen por ID con validación de permisos
   */
  static async getImageByIdWithPermissions(
    imageId: string,
    userId?: string
  ): Promise<Image | null> {
    const image = await getImageById(imageId);
    
    if (!image) {
      return null;
    }

    // Si la imagen no es pública, solo el propietario puede verla
    if (!image.isPublic && image.userId !== userId) {
      return null;
    }

    return image;
  }

  /**
   * Listar imágenes con filtros y paginación
   */
  static async listImagesWithPagination(
    filters: ImageFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{
    images: Image[];
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const offset = (page - 1) * limit;
    
    const allImages = await listImages({
      ...filters,
      limit: undefined,
      offset: undefined
    });

    const total = allImages.length;
    const images = allImages.slice(offset, offset + limit);
    const totalPages = Math.ceil(total / limit);

    return {
      images,
      total,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  /**
   * Actualizar imagen con validación de permisos
   */
  static async updateImageWithPermissions(
    imageId: string,
    userId: string,
    updateData: any
  ): Promise<Image> {
    const image = await getImageById(imageId);
    
    if (!image) {
      throw new Error('Imagen no encontrada');
    }

    if (image.userId !== userId) {
      throw new Error('No tienes permisos para actualizar esta imagen');
    }

    return await updateImage(imageId, updateData);
  }

  /**
   * Eliminar imagen con validación de permisos
   */
  static async deleteImageWithPermissions(
    imageId: string,
    userId: string
  ): Promise<boolean> {
    const image = await getImageById(imageId);
    
    if (!image) {
      throw new Error('Imagen no encontrada');
    }

    if (image.userId !== userId) {
      throw new Error('No tienes permisos para eliminar esta imagen');
    }

    return await deleteImage(imageId, userId);
  }

  /**
   * Obtener imágenes de perfil de un usuario
   */
  static async getUserProfileImages(userId: string): Promise<Image[]> {
    return await getUserProfileImages(userId);
  }

  /**
   * Obtener imágenes de posts
   */
  static async getPostImages(userId?: string): Promise<Image[]> {
    return await getPostImages(userId);
  }

  /**
   * Obtener imágenes de eventos
   */
  static async getEventImages(eventId?: string): Promise<Image[]> {
    return await getEventImages(eventId);
  }

  /**
   * Obtener estadísticas de imágenes
   */
  static async getImageStats() {
    return await getImageStats();
  }

  /**
   * Buscar imágenes por texto
   */
  static async searchImages(
    searchTerm: string,
    filters: ImageFilters = {}
  ): Promise<Image[]> {
    return await listImages({
      ...filters,
      search: searchTerm
    });
  }

  /**
   * Obtener imágenes por etiquetas
   */
  static async getImagesByTags(
    tags: string[],
    filters: ImageFilters = {}
  ): Promise<Image[]> {
    const images = await listImages(filters);
    
    return images.filter(image => 
      image.tags && tags.some(tag => image.tags!.includes(tag))
    );
  }

  /**
   * Obtener imágenes recientes
   */
  static async getRecentImages(
    limit: number = 10,
    filters: ImageFilters = {}
  ): Promise<Image[]> {
    return await listImages({
      ...filters,
      limit
    });
  }

  /**
   * Validar formato de imagen
   */
  static validateImageFormat(file: Express.Multer.File): boolean {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ];
    
    return allowedMimeTypes.includes(file.mimetype);
  }

  /**
   * Validar tamaño de imagen
   */
  static validateImageSize(file: Express.Multer.File, maxSize: number = 10 * 1024 * 1024): boolean {
    return file.size <= maxSize;
  }

  /**
   * Generar nombre de archivo único
   */
  static generateUniqueFileName(originalName: string, category: string, userId: string): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop();
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${category}/${userId}/${timestamp}_${sanitizedName}`;
  }

  /**
   * Obtener información de imagen sin descargar
   */
  static async getImageInfo(imageId: string): Promise<{
    id: string;
    originalName: string;
    size: number;
    mimetype: string;
    category: string;
    createdAt: string;
    isPublic: boolean;
  } | null> {
    const image = await getImageById(imageId);
    
    if (!image) {
      return null;
    }

    return {
      id: image.id,
      originalName: image.originalName,
      size: image.size,
      mimetype: image.mimetype,
      category: image.category,
      createdAt: image.createdAt,
      isPublic: image.isPublic
    };
  }
} 