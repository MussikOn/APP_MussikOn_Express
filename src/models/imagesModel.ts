import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, CopyObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Image, ImageFilters, ImageStats, ImageUpdateRequest } from "../utils/DataTypes";
import { db } from "../utils/firebase";
import * as admin from "firebase-admin";

// Configuración de idriveE2
const s3Client = new S3Client({
  region: process.env.IDRIVE_E2_REGION || 'us-east-1',
  endpoint: process.env.IDRIVE_E2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.IDRIVE_E2_ACCESS_KEY!,
    secretAccessKey: process.env.IDRIVE_E2_SECRET_KEY!,
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.IDRIVE_E2_BUCKET_NAME!;

// Configuración de validación
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

/**
 * Validar archivo antes de subir
 */
const validateFile = (file: Express.Multer.File): void => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`El archivo es demasiado grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }
  
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP, SVG)');
  }
};

/**
 * Generar nombre único para el archivo
 */
const generateFileName = (originalName: string, category: string, userId: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${category}/${userId}/${timestamp}_${randomString}.${extension}`;
};

/**
 * Subir imagen a idriveE2
 */
export const uploadImageToS3 = async (file: Express.Multer.File, key: string): Promise<{ key: string; size: number; mimetype: string }> => {
  try {
    validateFile(file);
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
        uploadedBy: 'mussikon-system',
        uploadedAt: new Date().toISOString()
      }
    });

    await s3Client.send(command);
    
    console.log(`[src/models/imagesModel.ts:uploadImageToS3] Imagen subida a idriveE2: ${key}`);
    
    return {
      key,
      size: file.size,
      mimetype: file.mimetype
    };
  } catch (error) {
    console.error('[src/models/imagesModel.ts:uploadImageToS3] Error al subir imagen a idriveE2:', error);
    throw error;
  }
};

/**
 * Generar URL firmada para acceso a imagen
 */
export const generateSignedUrl = async (key: string, expiresIn: number = 3600): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('[src/models/imagesModel.ts:generateSignedUrl] Error al generar URL firmada:', error);
    throw error;
  }
};

/**
 * Crear registro de imagen en Firestore
 */
export const createImageRecord = async (imageData: Omit<Image, 'id' | 'createdAt' | 'updatedAt'>): Promise<Image> => {
  try {
    const now = new Date().toISOString();
    const imageRef = db.collection("images").doc();
    
    const image: Image = {
      id: imageRef.id,
      ...imageData,
      createdAt: now,
      updatedAt: now
    };

    await imageRef.set(image);
    console.log(`[src/models/imagesModel.ts:createImageRecord] Registro de imagen creado en Firestore: ${image.id}`);
    return image;
  } catch (error) {
    console.error('[src/models/imagesModel.ts:createImageRecord] Error al crear registro de imagen:', error);
    throw error;
  }
};

/**
 * Subir imagen completa (idriveE2 + Firestore)
 */
export const uploadImage = async (
  file: Express.Multer.File,
  userId: string,
  category: Image['category'],
  metadata: {
    description?: string;
    tags?: string[];
    isPublic?: boolean;
    customMetadata?: Record<string, any>;
  } = {}
): Promise<Image> => {
  try {
    // Generar nombre único para el archivo
    const key = generateFileName(file.originalname, category, userId);
    
    // Subir a idriveE2
    const uploadResult = await uploadImageToS3(file, key);
    
    // Generar URL firmada
    const url = await generateSignedUrl(key);
    
    // Crear registro en Firestore
    const imageData: Omit<Image, 'id' | 'createdAt' | 'updatedAt'> = {
      key,
      url,
      originalName: file.originalname,
      fileName: key.split('/').pop() || file.originalname,
      size: uploadResult.size,
      mimetype: uploadResult.mimetype,
      category,
      userId,
      description: metadata.description || '',
      tags: metadata.tags || [],
      metadata: metadata.customMetadata || {},
      isPublic: metadata.isPublic !== undefined ? metadata.isPublic : true,
      isActive: true
    };

    const image = await createImageRecord(imageData);
    console.log(`[src/models/imagesModel.ts:uploadImage] Imagen subida exitosamente: ${image.id}`);
    return image;
  } catch (error) {
    console.error('[src/models/imagesModel.ts:uploadImage] Error al subir imagen:', error);
    throw error;
  }
};

/**
 * Obtener imagen por ID
 */
export const getImageById = async (imageId: string): Promise<Image | null> => {
  try {
    const imageDoc = await db.collection("images").doc(imageId).get();
    
    if (!imageDoc.exists) {
      return null;
    }

    const image = imageDoc.data() as Image;
    
    // Regenerar URL firmada si es necesario
    if (image.url && image.url.includes('expires=')) {
      const expiresMatch = image.url.match(/expires=(\d+)/);
      if (expiresMatch) {
        const expiresAt = parseInt(expiresMatch[1]);
        const now = Math.floor(Date.now() / 1000);
        
        if (expiresAt <= now + 300) { // Regenerar si expira en menos de 5 minutos
          image.url = await generateSignedUrl(image.key);
          await imageDoc.ref.update({ url: image.url, updatedAt: new Date().toISOString() });
        }
      }
    } else {
      // Si no tiene URL firmada, generarla
      image.url = await generateSignedUrl(image.key);
      await imageDoc.ref.update({ url: image.url, updatedAt: new Date().toISOString() });
    }

    return image;
  } catch (error) {
    console.error('[src/models/imagesModel.ts:getImageById] Error al obtener imagen:', error);
    throw error;
  }
};

/**
 * Listar imágenes con filtros
 */
export const listImages = async (filters: ImageFilters = {}): Promise<Image[]> => {
  try {
    let query: any = db.collection("images");

    // Aplicar filtros
    if (filters.category) {
      query = query.where("category", "==", filters.category);
    }
    if (filters.userId) {
      query = query.where("userId", "==", filters.userId);
    }
    if (filters.isPublic !== undefined) {
      query = query.where("isPublic", "==", filters.isPublic);
    }
    if (filters.isActive !== undefined) {
      query = query.where("isActive", "==", filters.isActive);
    }
    if (filters.metadata) {
      Object.entries(filters.metadata).forEach(([key, value]) => {
        query = query.where(`metadata.${key}`, "==", value);
      });
    }

    // Ordenar por fecha de creación (más reciente primero)
    query = query.orderBy("createdAt", "desc");

    // Aplicar límites
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    const snapshot = await query.get();
    const images = snapshot.docs.map((doc: any) => doc.data() as Image);

    // Regenerar URLs firmadas si es necesario
    const imagesWithUrls = await Promise.all(
      images.map(async (image: Image) => {
        try {
          if (image.url && image.url.includes('expires=')) {
            const expiresMatch = image.url.match(/expires=(\d+)/);
            if (expiresMatch) {
              const expiresAt = parseInt(expiresMatch[1]);
              const now = Math.floor(Date.now() / 1000);
              
              if (expiresAt <= now + 300) { // Regenerar si expira en menos de 5 minutos
                image.url = await generateSignedUrl(image.key);
                await db.collection("images").doc(image.id).update({ 
                  url: image.url, 
                  updatedAt: new Date().toISOString() 
                });
              }
            }
          } else {
            // Si no tiene URL firmada, generarla
            image.url = await generateSignedUrl(image.key);
            await db.collection("images").doc(image.id).update({ 
              url: image.url, 
              updatedAt: new Date().toISOString() 
            });
          }
          return image;
        } catch (error) {
          console.error(`[src/models/imagesModel.ts:listImages] Error al regenerar URL para imagen ${image.id}:`, error);
          return image;
        }
      })
    );

    console.log(`[src/models/imagesModel.ts:listImages] ${imagesWithUrls.length} imágenes encontradas`);
    return imagesWithUrls;
  } catch (error) {
    console.error('[src/models/imagesModel.ts:listImages] Error al listar imágenes:', error);
    throw error;
  }
};

/**
 * Actualizar imagen
 */
export const updateImage = async (imageId: string, updateData: ImageUpdateRequest): Promise<Image> => {
  try {
    const imageRef = db.collection("images").doc(imageId);
    const imageDoc = await imageRef.get();
    
    if (!imageDoc.exists) {
      throw new Error('Imagen no encontrada');
    }

    const updateFields: Partial<Image> = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await imageRef.update(updateFields);
    
    // Obtener imagen actualizada
    const updatedDoc = await imageRef.get();
    const updatedImage = updatedDoc.data() as Image;
    
    console.log(`[src/models/imagesModel.ts:updateImage] Imagen actualizada: ${imageId}`);
    return updatedImage;
  } catch (error) {
    console.error('[src/models/imagesModel.ts:updateImage] Error al actualizar imagen:', error);
    throw error;
  }
};

/**
 * Eliminar imagen (soft delete)
 */
export const deleteImage = async (imageId: string, userId: string): Promise<boolean> => {
  try {
    const imageRef = db.collection("images").doc(imageId);
    const imageDoc = await imageRef.get();
    
    if (!imageDoc.exists) {
      throw new Error('Imagen no encontrada');
    }

    const image = imageDoc.data() as Image;
    
    // Verificar permisos (solo el propietario o admin puede eliminar)
    if (image.userId !== userId) {
      // Verificar si el usuario es admin
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists || userDoc.data()?.roll !== 'admin') {
        throw new Error('No tienes permisos para eliminar esta imagen');
      }
    }

    // Soft delete - marcar como inactiva
    await imageRef.update({
      isActive: false,
      updatedAt: new Date().toISOString()
    });

    console.log(`[src/models/imagesModel.ts:deleteImage] Imagen marcada como eliminada: ${imageId}`);
    return true;
  } catch (error) {
    console.error('[src/models/imagesModel.ts:deleteImage] Error al eliminar imagen:', error);
    throw error;
  }
};

/**
 * Eliminar imagen de idriveE2 (hard delete)
 */
export const deleteImageFromS3 = async (key: string): Promise<boolean> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    await s3Client.send(command);
    console.log(`[src/models/imagesModel.ts:deleteImageFromS3] Imagen eliminada de idriveE2: ${key}`);
    return true;
  } catch (error) {
    console.error('[src/models/imagesModel.ts:deleteImageFromS3] Error al eliminar imagen de idriveE2:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de imágenes
 */
export const getImageStats = async (): Promise<ImageStats> => {
  try {
    const snapshot = await db.collection("images").where("isActive", "==", true).get();
    const images = snapshot.docs.map(doc => doc.data() as Image);

    const totalImages = images.length;
    const totalSize = images.reduce((sum, img) => sum + img.size, 0);
    
    const imagesByCategory: Record<string, number> = {};
    const imagesByUser: Record<string, number> = {};
    
    images.forEach(image => {
      imagesByCategory[image.category] = (imagesByCategory[image.category] || 0) + 1;
      imagesByUser[image.userId] = (imagesByUser[image.userId] || 0) + 1;
    });

    const recentUploads = images
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    const stats: ImageStats = {
      totalImages,
      totalSize,
      imagesByCategory,
      imagesByUser,
      recentUploads
    };

    console.log(`[src/models/imagesModel.ts:getImageStats] Estadísticas generadas: ${totalImages} imágenes, ${totalSize} bytes`);
    return stats;
  } catch (error) {
    console.error('[src/models/imagesModel.ts:getImageStats] Error al obtener estadísticas:', error);
    throw error;
  }
};

/**
 * Obtener imágenes de perfil de usuario
 */
export const getUserProfileImages = async (userId: string): Promise<Image[]> => {
  try {
    return await listImages({
      userId,
      category: 'profile',
      isActive: true,
    });
  } catch (error) {
    console.error('[src/models/imagesModel.ts:getUserProfileImages] Error al obtener imágenes de perfil:', error);
    throw error;
  }
};

/**
 * Obtener imágenes de posts
 */
export const getPostImages = async (userId?: string): Promise<Image[]> => {
  try {
    const filters: ImageFilters = {
      category: 'post',
      isActive: true,
      isPublic: true,
    };
    
    if (userId) {
      filters.userId = userId;
    }
    
    return await listImages(filters);
  } catch (error) {
    console.error('[src/models/imagesModel.ts:getPostImages] Error al obtener imágenes de posts:', error);
    throw error;
  }
};

/**
 * Obtener imágenes de eventos
 */
export const getEventImages = async (eventId?: string): Promise<Image[]> => {
  try {
    const filters: ImageFilters = {
      category: 'event',
      isActive: true,
    };
    
    if (eventId) {
      filters.metadata = { eventId };
    }
    
    return await listImages(filters);
  } catch (error) {
    console.error('[src/models/imagesModel.ts:getEventImages] Error al obtener imágenes de eventos:', error);
    throw error;
  }
};

/**
 * Limpiar imágenes expiradas (tareas de mantenimiento)
 */
export const cleanupExpiredImages = async (): Promise<number> => {
  try {
    const now = new Date();
    const snapshot = await db.collection("images")
      .where("expiresAt", "<=", now.toISOString())
      .where("isActive", "==", true)
      .get();
    
    let deletedCount = 0;
    
    for (const doc of snapshot.docs) {
      const image = doc.data() as Image;
      
      // Eliminar de idriveE2
      await deleteImageFromS3(image.key);
      
      // Marcar como inactiva en Firestore
      await doc.ref.update({
        isActive: false,
        updatedAt: now.toISOString(),
      });
      
      deletedCount++;
    }
    
    console.log(`[src/models/imagesModel.ts:cleanupExpiredImages] ${deletedCount} imágenes expiradas eliminadas`);
    return deletedCount;
  } catch (error) {
    console.error('[src/models/imagesModel.ts:cleanupExpiredImages] Error al limpiar imágenes expiradas:', error);
    throw error;
  }
};