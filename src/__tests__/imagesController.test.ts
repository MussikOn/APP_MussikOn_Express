import { Request, Response } from 'express';
import { imagesController } from '../controllers/imagesController';
import { imageService } from '../services/imageService';

// Mock the imageService
jest.mock('../services/imageService');
const mockImageService = require('../services/imageService');

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

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      // Arrange
      const userId = 'user123';
      const mockFile = {
        fieldname: 'file',
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
        url: 'https://example.com/test.jpg',
        filename: 'test-image-key',
        size: 1024,
        mimeType: 'image/jpeg',
        uploadedAt: new Date().toISOString(),
        metadata: {}
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
        body: { folder: 'uploads' }
      };

      mockImageService.uploadImage.mockResolvedValue(mockUploadResult);

      // Act
      await imagesController.uploadImage(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockImageService.uploadImage).toHaveBeenCalledWith(mockFile, userId, 'uploads', {});
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Imagen subida exitosamente',
        data: mockUploadResult
      });
    });

    it('should return error when no file provided', async () => {
      // Arrange
      mockRequest = {
        user: { 
          userId: 'user123',
          userEmail: 'user123',
          email: 'test@example.com',
          role: 'user',
          name: 'Test User'
        },
        file: undefined,
        body: { folder: 'uploads' }
      };

      // Act
      await imagesController.uploadImage(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No se proporcionó archivo'
      });
    });

    it('should handle service errors', async () => {
      // Arrange
      const userId = 'user123';
      const mockFile = {
        fieldname: 'file',
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
        body: { folder: 'uploads' }
      };

      mockImageService.uploadImage.mockRejectedValue(new Error('Upload failed'));

      // Act
      await imagesController.uploadImage(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error subiendo imagen. Intente nuevamente.'
      });
    });
  });

  describe('getImage', () => {
    it('should get image by id successfully', async () => {
      // Arrange
      const imageId = 'image123';
      const mockImage = {
        url: 'https://example.com/test.jpg',
        filename: 'test-image-key',
        size: 1024,
        mimeType: 'image/jpeg',
        uploadedAt: new Date().toISOString(),
        metadata: {}
      };

      mockRequest = {
        params: { imageId }
      };

      mockImageService.getImage.mockResolvedValue(mockImage);

      // Act
      await imagesController.getImage(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockImageService.getImage).toHaveBeenCalledWith(imageId);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockImage
      });
    });

    it('should return 404 when image not found', async () => {
      // Arrange
      const imageId = 'nonexistent';
      mockRequest = {
        params: { imageId }
      };

      mockImageService.getImage.mockResolvedValue(null);

      // Act
      await imagesController.getImage(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Imagen no encontrada'
      });
    });
  });

  describe('validateImageFile', () => {
    it('should validate image file successfully', async () => {
      // Arrange
      const mockFile = {
        fieldname: 'file',
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

      const mockValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
      };

      mockRequest = {
        file: mockFile
      };

      mockImageService.validateImageFile.mockReturnValue(mockValidationResult);

      // Act
      await imagesController.validateImageFile(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockImageService.validateImageFile).toHaveBeenCalledWith(mockFile);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockValidationResult
      });
    });
  });
}); 