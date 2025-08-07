# 🖼️ Sistema de Imágenes - MussikOn API

## 📋 Índice

- [Descripción General](#descripción-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Integración con IDrive E2](#integración-con-idrive-e2)
- [Optimización de Imágenes](#optimización-de-imágenes)
- [URLs Firmadas](#urls-firmadas)
- [Gestión de Vouchers](#gestión-de-vouchers)
- [Seguridad](#seguridad)

## 🎯 Descripción General

El Sistema de Imágenes de MussikOn maneja el almacenamiento, optimización y distribución de imágenes de la plataforma, utilizando IDrive E2 como almacenamiento principal con URLs firmadas para acceso seguro.

### Características Principales

- **Almacenamiento en IDrive E2**: Almacenamiento S3-compatible escalable
- **Optimización Automática**: Redimensionamiento y compresión automática
- **URLs Firmadas**: Acceso seguro con expiración temporal
- **Gestión de Vouchers**: Sistema especializado para imágenes de vouchers
- **CDN Integration**: Distribución global de contenido

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
src/
├── controllers/
│   └── imagesController.ts            # Controlador de imágenes
├── services/
│   ├── imageService.ts                # Servicio de imágenes
│   └── idriveService.ts               # Servicio de IDrive E2
├── routes/
│   └── imagesRoutes.ts                # Rutas de imágenes
├── utils/
│   └── idriveE2.ts                    # Utilidades de IDrive E2
└── types/
    └── imageTypes.ts                  # Tipos de imágenes
```

## ☁️ Integración con IDrive E2

### Configuración

```typescript
// utils/idriveE2.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class IDriveE2Service {
  private s3Client: S3Client;
  private bucketName: string;
  
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.IDRIVE_REGION || 'us-east-1',
      endpoint: process.env.IDRIVE_ENDPOINT,
      credentials: {
        accessKeyId: process.env.IDRIVE_ACCESS_KEY!,
        secretAccessKey: process.env.IDRIVE_SECRET_KEY!
      }
    });
    
    this.bucketName = process.env.IDRIVE_BUCKET_NAME!;
  }
  
  async uploadImage(
    file: Buffer,
    fileName: string,
    contentType: string
  ): Promise<UploadResult> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file,
        ContentType: contentType,
        ACL: 'private'
      });
      
      await this.s3Client.send(command);
      
      return {
        success: true,
        fileName,
        url: `${process.env.IDRIVE_ENDPOINT}/${this.bucketName}/${fileName}`
      };
    } catch (error) {
      logger.error('Error uploading to IDrive E2:', error);
      throw new Error('Error al subir imagen');
    }
  }
  
  async generateSignedUrl(fileName: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileName
      });
      
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      logger.error('Error generating signed URL:', error);
      throw new Error('Error al generar URL firmada');
    }
  }
}
```

## 🎨 Optimización de Imágenes

### Servicio de Optimización

```typescript
// services/imageService.ts
import sharp from 'sharp';

export class ImageService {
  async optimizeImage(
    imageBuffer: Buffer,
    options: OptimizationOptions
  ): Promise<OptimizedImage> {
    try {
      let processedImage = sharp(imageBuffer);
      
      // Redimensionar si es necesario
      if (options.width || options.height) {
        processedImage = processedImage.resize(options.width, options.height, {
          fit: options.fit || 'cover',
          withoutEnlargement: true
        });
      }
      
      // Aplicar formato
      if (options.format) {
        switch (options.format) {
          case 'webp':
            processedImage = processedImage.webp({ quality: options.quality || 80 });
            break;
          case 'jpeg':
            processedImage = processedImage.jpeg({ quality: options.quality || 80 });
            break;
          case 'png':
            processedImage = processedImage.png({ quality: options.quality || 80 });
            break;
        }
      }
      
      // Aplicar efectos
      if (options.blur) {
        processedImage = processedImage.blur(options.blur);
      }
      
      if (options.sharpen) {
        processedImage = processedImage.sharpen();
      }
      
      const optimizedBuffer = await processedImage.toBuffer();
      
      return {
        buffer: optimizedBuffer,
        size: optimizedBuffer.length,
        format: options.format || 'jpeg',
        dimensions: await this.getImageDimensions(processedImage)
      };
    } catch (error) {
      logger.error('Error optimizing image:', error);
      throw new Error('Error al optimizar imagen');
    }
  }
  
  async createThumbnail(
    imageBuffer: Buffer,
    size: number = 200
  ): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .resize(size, size, { fit: 'cover' })
        .jpeg({ quality: 70 })
        .toBuffer();
    } catch (error) {
      logger.error('Error creating thumbnail:', error);
      throw new Error('Error al crear miniatura');
    }
  }
}
```

## 🔐 URLs Firmadas

### Generación de URLs Seguras

```typescript
// services/imageService.ts
export class ImageService {
  async getSignedImageUrl(
    imageId: string,
    options: SignedUrlOptions = {}
  ): Promise<string> {
    try {
      const image = await this.getImageById(imageId);
      
      if (!image) {
        throw new Error('Imagen no encontrada');
      }
      
      // Verificar permisos de acceso
      await this.validateImageAccess(image, options.userId);
      
      // Generar URL firmada
      const signedUrl = await this.idriveService.generateSignedUrl(
        image.fileName,
        options.expiresIn || 3600
      );
      
      // Registrar acceso
      await this.logImageAccess(imageId, options.userId);
      
      return signedUrl;
    } catch (error) {
      logger.error('Error generating signed URL:', error);
      throw new Error('Error al generar URL de imagen');
    }
  }
  
  async getImageUrls(
    imageIds: string[],
    userId: string
  ): Promise<ImageUrlMap> {
    try {
      const urls: ImageUrlMap = {};
      
      await Promise.all(
        imageIds.map(async (imageId) => {
          try {
            urls[imageId] = await this.getSignedImageUrl(imageId, { userId });
          } catch (error) {
            urls[imageId] = null;
            logger.error(`Error getting URL for image ${imageId}:`, error);
          }
        })
      );
      
      return urls;
    } catch (error) {
      logger.error('Error getting image URLs:', error);
      throw new Error('Error al obtener URLs de imágenes');
    }
  }
}
```

## 🎫 Gestión de Vouchers

### Sistema Especializado de Vouchers

```typescript
// services/voucherImageService.ts
export class VoucherImageService {
  async uploadVoucherImage(
    voucherId: string,
    imageBuffer: Buffer,
    metadata: VoucherImageMetadata
  ): Promise<VoucherImage> {
    try {
      // 1. Optimizar imagen para voucher
      const optimizedImage = await this.imageService.optimizeImage(imageBuffer, {
        width: 800,
        height: 600,
        format: 'jpeg',
        quality: 85
      });
      
      // 2. Crear miniatura
      const thumbnail = await this.imageService.createThumbnail(imageBuffer);
      
      // 3. Generar nombres de archivo
      const fileName = `vouchers/${voucherId}/${Date.now()}.jpg`;
      const thumbnailName = `vouchers/${voucherId}/thumb_${Date.now()}.jpg`;
      
      // 4. Subir a IDrive E2
      const [mainUpload, thumbUpload] = await Promise.all([
        this.idriveService.uploadImage(optimizedImage.buffer, fileName, 'image/jpeg'),
        this.idriveService.uploadImage(thumbnail, thumbnailName, 'image/jpeg')
      ]);
      
      // 5. Guardar en base de datos
      const voucherImage = await this.saveVoucherImage({
        voucherId,
        fileName: mainUpload.fileName,
        thumbnailName: thumbUpload.fileName,
        metadata,
        size: optimizedImage.size,
        dimensions: optimizedImage.dimensions
      });
      
      return voucherImage;
    } catch (error) {
      logger.error('Error uploading voucher image:', error);
      throw new Error('Error al subir imagen de voucher');
    }
  }
  
  async getVoucherImages(voucherId: string): Promise<VoucherImage[]> {
    try {
      const images = await this.getVoucherImagesFromDB(voucherId);
      
      // Generar URLs firmadas para cada imagen
      const imagesWithUrls = await Promise.all(
        images.map(async (image) => ({
          ...image,
          url: await this.idriveService.generateSignedUrl(image.fileName, 3600),
          thumbnailUrl: await this.idriveService.generateSignedUrl(image.thumbnailName, 3600)
        }))
      );
      
      return imagesWithUrls;
    } catch (error) {
      logger.error('Error getting voucher images:', error);
      throw new Error('Error al obtener imágenes de voucher');
    }
  }
}
```

## 🛡️ Seguridad

### Validación y Control de Acceso

```typescript
// services/imageService.ts
export class ImageSecurityService {
  async validateImageAccess(
    image: Image,
    userId: string
  ): Promise<boolean> {
    try {
      // Verificar si el usuario es propietario
      if (image.ownerId === userId) {
        return true;
      }
      
      // Verificar permisos compartidos
      if (image.sharedWith && image.sharedWith.includes(userId)) {
        return true;
      }
      
      // Verificar permisos de evento
      if (image.eventId) {
        const event = await this.getEventById(image.eventId);
        if (event.organizerId === userId || event.musicians.includes(userId)) {
          return true;
        }
      }
      
      // Verificar permisos de administrador
      const user = await this.getUserById(userId);
      if (user.role === 'admin' || user.role === 'super_admin') {
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error validating image access:', error);
      return false;
    }
  }
  
  async scanImageForMalware(imageBuffer: Buffer): Promise<ScanResult> {
    try {
      // Implementar escaneo de malware
      // Por ahora, validación básica de formato
      const isValidFormat = await this.validateImageFormat(imageBuffer);
      
      return {
        isClean: isValidFormat,
        threats: isValidFormat ? [] : ['invalid_format']
      };
    } catch (error) {
      logger.error('Error scanning image:', error);
      return { isClean: false, threats: ['scan_error'] };
    }
  }
  
  private async validateImageFormat(buffer: Buffer): Promise<boolean> {
    try {
      const metadata = await sharp(buffer).metadata();
      return ['jpeg', 'png', 'webp', 'gif'].includes(metadata.format || '');
    } catch {
      return false;
    }
  }
}
```

---

**Anterior**: [Sistema de Chat](../chat-system/README.md)  
**Siguiente**: [Búsqueda Avanzada](../search-system/README.md) 