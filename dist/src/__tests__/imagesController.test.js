"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const imagesController_1 = require("../controllers/imagesController");
// Mock the imageService
jest.mock('../services/imageService', () => ({
    imageService: {
        uploadImage: jest.fn(),
        getImage: jest.fn(),
        validateImageFile: jest.fn(),
        deleteImage: jest.fn(),
        updateImageMetadata: jest.fn()
    }
}));
const { imageService: mockImageService } = require('../services/imageService');
describe('ImagesController', () => {
    let mockRequest;
    let mockResponse;
    let mockStatus;
    let mockJson;
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
        it('should upload image successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const userId = 'user123';
            const mockFile = {
                fieldname: 'file',
                originalname: 'test.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                buffer: Buffer.from('test image'),
                size: 1024,
                stream: {},
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
            yield imagesController_1.imagesController.uploadImage(mockRequest, mockResponse);
            // Assert
            expect(mockImageService.uploadImage).toHaveBeenCalledWith(mockFile, userId, 'uploads', {
                description: undefined,
                tags: [],
                uploadedBy: userId
            });
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Imagen subida exitosamente',
                data: mockUploadResult
            });
        }));
        it('should return error when no file provided', () => __awaiter(void 0, void 0, void 0, function* () {
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
            yield imagesController_1.imagesController.uploadImage(mockRequest, mockResponse);
            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'No se proporcionó archivo'
            });
        }));
        it('should handle service errors', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const userId = 'user123';
            const mockFile = {
                fieldname: 'file',
                originalname: 'test.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                buffer: Buffer.from('test image'),
                size: 1024,
                stream: {},
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
            yield imagesController_1.imagesController.uploadImage(mockRequest, mockResponse);
            // Assert
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                error: 'Error subiendo imagen'
            });
        }));
    });
    describe('getImage', () => {
        it('should get image by id successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            yield imagesController_1.imagesController.getImage(mockRequest, mockResponse);
            // Assert
            expect(mockImageService.getImage).toHaveBeenCalledWith(imageId);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockImage
            });
        }));
        it('should return 404 when image not found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const imageId = 'nonexistent';
            mockRequest = {
                params: { imageId }
            };
            mockImageService.getImage.mockResolvedValue(null);
            // Act
            yield imagesController_1.imagesController.getImage(mockRequest, mockResponse);
            // Assert
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                error: 'Imagen no encontrada'
            });
        }));
    });
    describe('validateImageFile', () => {
        it('should validate image file successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const mockFile = {
                fieldname: 'file',
                originalname: 'test.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                buffer: Buffer.from('test image'),
                size: 1024,
                stream: {},
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
            yield imagesController_1.imagesController.validateImageFile(mockRequest, mockResponse);
            // Assert
            expect(mockImageService.validateImageFile).toHaveBeenCalledWith(mockFile);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Archivo válido',
                data: mockValidationResult
            });
        }));
    });
});
