import { Request, Response } from 'express';
import { 
  uploadImageController,
  getImageByIdController,
  listImagesController,
  updateImageController,
  deleteImageController,
  getImageStatsController,
  getUserProfileImagesController,
  getPostImagesController,
  getEventImagesController
} from '../controllers/imagesController';
import { ImageService } from '../services/imageService';

// Mock the imagesModel
jest.mock('../models/imagesModel');
const mockImagesModel = require('../models/imagesModel');

describe('ImagesController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn().mockReturnThis();
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };
    jest.clearAllMocks();
  });

  describe('uploadImageController', () => {
    it('should upload image successfully', async () => {
      // Arrange
      const userId = 'user123';
      const mockFile = {
        fieldname: 'image',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test image'),
        size: 1024,
        stream: {} as any,
        destination: '',
        filename: 'test.jpg',
        path: ''
      };

      const mockUploadResult = {
        id: 'image-1',
        userId: 'user123',
        key: 'test-image-key',
        originalName: 'test.jpg',
        fileName: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        url: 'https://example.com/test.jpg',
        category: 'profile' as const,
        isPublic: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockRequest = {
        user: { 
          userId: userId,
          userEmail: userId,
          email: 'test@example.com',
          role: 'user',
          name: 'Test User'
        },
        file: mockFile,
        body: { category: 'profile' }
      };

      mockImagesModel.uploadImage.mockResolvedValue(mockUploadResult);

      // Act
      await uploadImageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockImagesModel.uploadImage).toHaveBeenCalledWith(mockFile, userId, 'profile', {
        description: '',
        tags: [],
        isPublic: true
      });
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Imagen subida exitosamente',
        image: mockUploadResult
      });
    });

    it('should return error when no file provided', async () => {
      // Arrange
      const userId = 'user123';
      mockRequest = {
        user: { 
          userId: userId,
          userEmail: userId,
          email: 'test@example.com',
          role: 'user',
          name: 'Test User'
        },
        file: undefined,
        body: { category: 'profile' }
      };

      // Act
      await uploadImageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'No se proporcionó ningún archivo'
      });
    });

    it('should return error when user is not authenticated', async () => {
      // Arrange
      mockRequest = {
        user: undefined,
        file: { 
          fieldname: 'image',
          originalname: 'test.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('test'),
          size: 1024,
          stream: {} as any,
          destination: '',
          filename: 'test.jpg',
          path: ''
        },
        body: { category: 'profile' }
      };

      // Act
      await uploadImageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Usuario no autenticado'
      });
    });

    it('should handle service errors', async () => {
      // Arrange
      const userId = 'user123';
      const mockFile = {
        fieldname: 'image',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test image'),
        size: 1024,
        stream: {} as any,
        destination: '',
        filename: 'test.jpg',
        path: ''
      };

      mockRequest = {
        user: { 
          userId: userId,
          userEmail: userId,
          email: 'test@example.com',
          role: 'user',
          name: 'Test User'
        },
        file: mockFile,
        body: { category: 'profile' }
      };

      mockImagesModel.uploadImage.mockRejectedValue(new Error('Upload failed'));

      // Act
      await uploadImageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Error al subir imagen',
        details: 'Upload failed'
      });
    });
  });

  describe('getImageByIdController', () => {
    it('should get image by id successfully', async () => {
      // Arrange
      const imageId = 'image123';
      const mockImage = {
        id: imageId,
        userId: 'user123',
        key: 'test-image-key',
        originalName: 'test.jpg',
        fileName: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        url: 'https://example.com/test.jpg',
        category: 'profile' as const,
        isPublic: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockRequest = {
        params: { imageId },
        user: { 
          userId: 'user123',
          userEmail: 'user123',
          email: 'test@example.com',
          role: 'user',
          name: 'Test User'
        }
      };

      mockImagesModel.getImageById.mockResolvedValue(mockImage);

      // Act
      await getImageByIdController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockImagesModel.getImageById).toHaveBeenCalledWith(imageId);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        image: mockImage
      });
    });

    it('should return 404 when image not found', async () => {
      // Arrange
      const imageId = 'nonexistent';
      mockRequest = {
        params: { imageId },
        user: { 
          userId: 'user123',
          userEmail: 'user123',
          email: 'test@example.com',
          role: 'user',
          name: 'Test User'
        }
      };

      mockImagesModel.getImageById.mockResolvedValue(null);

      // Act
      await getImageByIdController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Imagen no encontrada'
      });
    });
  });

  describe('listImagesController', () => {
    it('should list images successfully', async () => {
      // Arrange
      const mockImages = [
        {
          id: 'image1',
          userId: 'user123',
          key: 'image1-key',
          originalName: 'image1.jpg',
          fileName: 'image1.jpg',
          mimetype: 'image/jpeg',
          size: 1024,
          url: 'https://example.com/image1.jpg',
          category: 'profile' as const,
          isPublic: false,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'image2',
          userId: 'user123',
          key: 'image2-key',
          originalName: 'image2.jpg',
          fileName: 'image2.jpg',
          mimetype: 'image/jpeg',
          size: 2048,
          url: 'https://example.com/image2.jpg',
          category: 'post' as const,
          isPublic: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      mockRequest = {
        query: { page: '1', limit: '10' },
        user: { 
          userId: 'user123',
          userEmail: 'user123',
          email: 'test@example.com',
          role: 'user',
          name: 'Test User'
        }
      };

      mockImagesModel.listImages.mockResolvedValue({
        images: mockImages,
        total: 2,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });

      // Act
      await listImagesController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockImagesModel.listImages).toHaveBeenCalledWith({
        limit: 10
      });
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        images: {
          images: mockImages,
          total: 2,
          page: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        },
        total: undefined,
        filters: {
          limit: 10
        }
      });
    });
  });

  describe('updateImageController', () => {
    it('should update image successfully', async () => {
      // Arrange
      const imageId = 'image123';
      const updateData = {
        description: 'Updated description',
        tags: ['tag1', 'tag2'],
        isPublic: false
      };

      const mockUpdatedImage = {
        id: imageId,
        userId: 'user123',
        key: 'test-image-key',
        originalName: 'test.jpg',
        fileName: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        url: 'https://example.com/test.jpg',
        category: 'profile' as const,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...updateData
      };

      mockRequest = {
        params: { imageId },
        body: updateData,
        user: { 
          userId: 'user123',
          userEmail: 'user123',
          email: 'test@example.com',
          role: 'user',
          name: 'Test User'
        }
      };

      mockImagesModel.getImageById.mockResolvedValue({
        id: imageId,
        userId: 'user123',
        key: 'test-image-key',
        originalName: 'test.jpg',
        fileName: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        url: 'https://example.com/test.jpg',
        category: 'profile' as const,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      mockImagesModel.updateImage.mockResolvedValue(mockUpdatedImage);

      // Act
      await updateImageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockImagesModel.updateImage).toHaveBeenCalledWith(imageId, updateData);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Imagen actualizada exitosamente',
        image: mockUpdatedImage
      });
    });
  });

  describe('deleteImageController', () => {
    it('should delete image successfully', async () => {
      // Arrange
      const imageId = 'image123';
      mockRequest = {
        params: { imageId },
        user: { 
          userId: 'user123',
          userEmail: 'user123',
          email: 'test@example.com',
          role: 'user',
          name: 'Test User'
        }
      };

      mockImagesModel.deleteImage.mockResolvedValue(true);

      // Act
      await deleteImageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockImagesModel.deleteImage).toHaveBeenCalledWith(imageId, 'user123');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Imagen eliminada exitosamente'
      });
    });
  });

  describe('getImageStatsController', () => {
    it('should get image stats successfully', async () => {
      // Arrange
      const mockStats = {
        totalImages: 100,
        totalSize: 1024000,
        averageSize: 10240,
        imagesByCategory: {
          profile: 20,
          post: 30,
          event: 25,
          gallery: 25
        },
        imagesByUser: { 'user123': 50, 'user456': 50 },
        recentUploads: [{
          id: 'image1',
          userId: 'user123',
          key: 'image1-key',
          originalName: 'image1.jpg',
          fileName: 'image1.jpg',
          mimetype: 'image/jpeg',
          size: 1024,
          url: 'https://example.com/image1.jpg',
          category: 'profile' as const,
          isPublic: false,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }]
      };

      mockRequest = {
        user: { 
          userId: 'admin123',
          userEmail: 'admin123',
          email: 'admin@example.com',
          role: 'adminSenior',
          roll: 'adminSenior',
          name: 'Admin User'
        }
      };

      mockImagesModel.getImageStats.mockResolvedValue(mockStats);

      // Act
      await getImageStatsController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockImagesModel.getImageStats).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        stats: mockStats
      });
    });
  });

  describe('getUserProfileImagesController', () => {
    it('should get user profile images successfully', async () => {
      // Arrange
      const userId = 'user123';
      const mockImages = [
        {
          id: 'image1',
          userId: 'user123',
          key: 'image1-key',
          originalName: 'image1.jpg',
          fileName: 'image1.jpg',
          mimetype: 'image/jpeg',
          size: 1024,
          url: 'https://example.com/image1.jpg',
          category: 'profile' as const,
          isPublic: false,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      mockRequest = {
        params: { userId },
        user: { 
          userId: 'user123',
          userEmail: 'user123',
          email: 'test@example.com',
          role: 'user',
          name: 'Test User'
        }
      };

      mockImagesModel.getUserProfileImages.mockResolvedValue(mockImages);

      // Act
      await getUserProfileImagesController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockImagesModel.getUserProfileImages).toHaveBeenCalledWith(userId);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        images: mockImages
      });
    });
  });

  describe('getPostImagesController', () => {
    it('should get post images successfully', async () => {
      // Arrange
      const postId = 'post123';
      const mockImages = [
        {
          id: 'image1',
          userId: 'user123',
          key: 'image1-key',
          originalName: 'image1.jpg',
          fileName: 'image1.jpg',
          mimetype: 'image/jpeg',
          size: 1024,
          url: 'https://example.com/image1.jpg',
          category: 'post' as const,
          isPublic: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      mockRequest = {
        query: { userId: 'user123' },
        user: { 
          userId: 'user123',
          userEmail: 'user123',
          email: 'test@example.com',
          role: 'user',
          name: 'Test User'
        }
      };

      mockImagesModel.getPostImages.mockResolvedValue(mockImages);

      // Act
      await getPostImagesController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockImagesModel.getPostImages).toHaveBeenCalledWith('user123');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        images: mockImages
      });
    });
  });

  describe('getEventImagesController', () => {
    it('should get event images successfully', async () => {
      // Arrange
      const eventId = 'event123';
      const mockImages = [
        {
          id: 'image1',
          userId: 'user123',
          key: 'image1-key',
          originalName: 'image1.jpg',
          fileName: 'image1.jpg',
          mimetype: 'image/jpeg',
          size: 1024,
          url: 'https://example.com/image1.jpg',
          category: 'event' as const,
          isPublic: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      mockRequest = {
        query: { eventId },
        user: { 
          userId: 'user123',
          userEmail: 'user123',
          email: 'test@example.com',
          role: 'user',
          name: 'Test User'
        }
      };

      mockImagesModel.getEventImages.mockResolvedValue(mockImages);

      // Act
      await getEventImagesController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockImagesModel.getEventImages).toHaveBeenCalledWith(eventId);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        images: mockImages
      });
    });
  });






}); 