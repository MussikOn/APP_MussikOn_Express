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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3 = exports.listImagesWithSignedUrls = exports.listObjectsFromS3 = exports.extractKeyFromUrl = exports.getImageFromS3 = exports.generatePresignedUploadUrl = exports.generatePresignedUrl = exports.getFileInfo = exports.fileExistsInS3 = exports.deleteFromS3 = exports.downloadFromS3 = exports.uploadToS3 = void 0;
exports.getS3Client = getS3Client;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const loggerService_1 = require("../services/loggerService");
// Clase para manejar la renovación automática de tokens
class TokenManager {
    constructor(accessKeyId, secretAccessKey, region, endpoint) {
        this.accessKeyId = accessKeyId;
        this.secretAccessKey = secretAccessKey;
        this.region = region;
        this.endpoint = endpoint;
        this.currentToken = null;
        this.tokenExpirationBuffer = 5 * 60 * 1000; // 5 minutos antes de expirar
    }
    /**
     * Obtiene un token válido, renovándolo si es necesario
     */
    getValidToken() {
        return __awaiter(this, void 0, void 0, function* () {
            // Si no hay token o está próximo a expirar, renovar
            if (!this.currentToken || this.isTokenExpiringSoon()) {
                yield this.refreshToken();
            }
            return this.currentToken;
        });
    }
    /**
     * Verifica si el token actual está próximo a expirar
     */
    isTokenExpiringSoon() {
        var _a;
        if (!((_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.expiration))
            return true;
        const now = new Date();
        const expirationTime = this.currentToken.expiration.getTime();
        const bufferTime = now.getTime() + this.tokenExpirationBuffer;
        return bufferTime >= expirationTime;
    }
    /**
     * Renueva el token de acceso
     */
    refreshToken() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('[src/utils/idriveE2.ts] Renovando token de acceso para IDrive E2');
                // Para IDrive E2, generalmente usamos credenciales permanentes
                // Si necesitas tokens temporales, aquí implementarías la lógica de renovación
                this.currentToken = {
                    accessKeyId: this.accessKeyId,
                    secretAccessKey: this.secretAccessKey,
                    expiration: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
                };
                loggerService_1.logger.info('[src/utils/idriveE2.ts] Token renovado exitosamente');
            }
            catch (error) {
                loggerService_1.logger.error('[src/utils/idriveE2.ts] Error renovando token:', error instanceof Error ? error : new Error(String(error)));
                throw new Error('Error renovando token de acceso');
            }
        });
    }
    /**
     * Crea un cliente S3 con el token actual
     */
    createS3Client() {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.getValidToken();
            return new client_s3_1.S3Client({
                region: this.region,
                endpoint: this.endpoint,
                credentials: {
                    accessKeyId: token.accessKeyId,
                    secretAccessKey: token.secretAccessKey,
                    sessionToken: token.sessionToken,
                },
                forcePathStyle: true,
            });
        });
    }
}
// Instancia global del administrador de tokens
let tokenManager = null;
/**
 * Inicializa el administrador de tokens
 */
function initializeTokenManager() {
    if (!tokenManager) {
        const accessKeyId = process.env.IDRIVE_E2_ACCESS_KEY;
        const secretAccessKey = process.env.IDRIVE_E2_SECRET_KEY;
        const region = process.env.IDRIVE_E2_REGION;
        const endpoint = process.env.IDRIVE_E2_ENDPOINT;
        if (!accessKeyId || !secretAccessKey || !region || !endpoint) {
            throw new Error('Variables de entorno de IDrive E2 no configuradas correctamente');
        }
        tokenManager = new TokenManager(accessKeyId, secretAccessKey, region, endpoint);
        loggerService_1.logger.info('[src/utils/idriveE2.ts] Administrador de tokens inicializado');
    }
    return tokenManager;
}
/**
 * Obtiene un cliente S3 válido con token renovado
 */
function getS3Client() {
    return __awaiter(this, void 0, void 0, function* () {
        const manager = initializeTokenManager();
        return yield manager.createS3Client();
    });
}
/**
 * Genera una URL correcta para IDrive E2
 */
function generateCorrectUrl(bucketName, key) {
    const endpoint = process.env.IDRIVE_E2_ENDPOINT;
    if (!endpoint) {
        throw new Error('IDRIVE_E2_ENDPOINT no configurado');
    }
    // Para IDrive E2, usar el formato específico del endpoint
    if (endpoint.includes('idrivee2')) {
        // Formato específico de IDrive E2
        return `${endpoint}/${bucketName}/${key}`;
    }
    else if (endpoint.includes('amazonaws.com')) {
        // Formato estándar de AWS S3
        return `https://${bucketName}.s3.${process.env.IDRIVE_E2_REGION}.amazonaws.com/${key}`;
    }
    else {
        // Formato genérico para otros proveedores S3
        return `${endpoint}/${bucketName}/${key}`;
    }
}
/**
 * Sube un archivo a iDrive E2 (S3) con manejo automático de tokens y configuración mejorada
 */
const uploadToS3 = (file_1, fileName_1, contentType_1, ...args_1) => __awaiter(void 0, [file_1, fileName_1, contentType_1, ...args_1], void 0, function* (file, fileName, contentType, folder = 'uploads') {
    try {
        // Validar variables de entorno
        if (!process.env.IDRIVE_E2_BUCKET_NAME || !process.env.IDRIVE_E2_ENDPOINT) {
            throw new Error('Variables de entorno de iDrive E2 no configuradas');
        }
        const key = `${folder}/${Date.now()}-${fileName}`;
        // Obtener cliente S3 con token renovado
        const s3Client = yield getS3Client();
        const command = new client_s3_1.PutObjectCommand({
            Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
            Key: key,
            Body: file,
            ContentType: contentType,
            ACL: 'public-read', // Configurar como público para acceso directo
            CacheControl: 'public, max-age=3600', // Cache por 1 hora
        });
        yield s3Client.send(command);
        // Generar URL correcta para IDrive E2
        const fileUrl = generateCorrectUrl(process.env.IDRIVE_E2_BUCKET_NAME, key);
        loggerService_1.logger.info('[src/utils/idriveE2.ts] Archivo subido exitosamente:', {
            metadata: {
                bucket: process.env.IDRIVE_E2_BUCKET_NAME,
                key,
                url: fileUrl,
                contentType,
                size: file.length
            }
        });
        return fileUrl;
    }
    catch (error) {
        loggerService_1.logger.error('[src/utils/idriveE2.ts] Error al subir archivo a S3:', error instanceof Error ? error : new Error(String(error)));
        throw new Error('Error al subir archivo a S3');
    }
});
exports.uploadToS3 = uploadToS3;
/**
 * Descarga un archivo de iDrive E2
 */
const downloadFromS3 = (key) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    try {
        const s3Client = yield getS3Client();
        const command = new client_s3_1.GetObjectCommand({
            Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
            Key: key,
        });
        const response = yield s3Client.send(command);
        if (!response.Body) {
            throw new Error('Archivo no encontrado');
        }
        // Convertir stream a buffer
        const chunks = [];
        try {
            for (var _d = true, _e = __asyncValues(response.Body), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                _c = _f.value;
                _d = false;
                const chunk = _c;
                chunks.push(chunk);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return Buffer.concat(chunks);
    }
    catch (error) {
        loggerService_1.logger.error('[src/utils/idriveE2.ts] Error al descargar archivo de S3:', error instanceof Error ? error : new Error(String(error)));
        throw new Error('Error al descargar archivo de S3');
    }
});
exports.downloadFromS3 = downloadFromS3;
/**
 * Elimina un archivo de iDrive E2
 */
const deleteFromS3 = (key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const s3Client = yield getS3Client();
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
            Key: key,
        });
        yield s3Client.send(command);
        loggerService_1.logger.info('[src/utils/idriveE2.ts] Archivo eliminado exitosamente:', { metadata: { key } });
        return true;
    }
    catch (error) {
        loggerService_1.logger.error('[src/utils/idriveE2.ts] Error al eliminar archivo de S3:', error instanceof Error ? error : new Error(String(error)));
        return false;
    }
});
exports.deleteFromS3 = deleteFromS3;
/**
 * Verifica si un archivo existe en iDrive E2
 */
const fileExistsInS3 = (key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const s3Client = yield getS3Client();
        const command = new client_s3_1.HeadObjectCommand({
            Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
            Key: key,
        });
        yield s3Client.send(command);
        return true;
    }
    catch (error) {
        return false;
    }
});
exports.fileExistsInS3 = fileExistsInS3;
/**
 * Obtiene información de un archivo en iDrive E2
 */
const getFileInfo = (key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const s3Client = yield getS3Client();
        const command = new client_s3_1.HeadObjectCommand({
            Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
            Key: key,
        });
        const response = yield s3Client.send(command);
        return {
            exists: true,
            size: response.ContentLength,
            lastModified: response.LastModified,
            contentType: response.ContentType,
        };
    }
    catch (error) {
        return {
            exists: false,
        };
    }
});
exports.getFileInfo = getFileInfo;
/**
 * Genera una URL firmada para acceder a un archivo en iDrive E2
 * Esta función resuelve problemas de CORS y Access Denied
 */
const generatePresignedUrl = (key_1, ...args_1) => __awaiter(void 0, [key_1, ...args_1], void 0, function* (key, expiresIn = 3600 // 1 hora por defecto
) {
    try {
        const s3Client = yield getS3Client();
        const command = new client_s3_1.GetObjectCommand({
            Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
            Key: key,
        });
        const presignedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, {
            expiresIn
        });
        loggerService_1.logger.info('[src/utils/idriveE2.ts] URL firmada generada exitosamente:', {
            metadata: {
                key,
                expiresIn,
                url: presignedUrl.substring(0, 100) + '...' // Solo mostrar parte de la URL por seguridad
            }
        });
        return presignedUrl;
    }
    catch (error) {
        loggerService_1.logger.error('[src/utils/idriveE2.ts] Error al generar URL firmada:', error instanceof Error ? error : new Error(String(error)));
        throw new Error('Error al generar URL firmada');
    }
});
exports.generatePresignedUrl = generatePresignedUrl;
/**
 * Genera una URL firmada para subir un archivo a iDrive E2
 */
const generatePresignedUploadUrl = (key_1, contentType_1, ...args_1) => __awaiter(void 0, [key_1, contentType_1, ...args_1], void 0, function* (key, contentType, expiresIn = 3600 // 1 hora por defecto
) {
    try {
        const s3Client = yield getS3Client();
        const command = new client_s3_1.PutObjectCommand({
            Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        });
        const presignedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, {
            expiresIn
        });
        loggerService_1.logger.info('[src/utils/idriveE2.ts] URL firmada de subida generada exitosamente:', {
            metadata: {
                key,
                contentType,
                expiresIn,
                url: presignedUrl.substring(0, 100) + '...' // Solo mostrar parte de la URL por seguridad
            }
        });
        return presignedUrl;
    }
    catch (error) {
        loggerService_1.logger.error('[src/utils/idriveE2.ts] Error al generar URL firmada de subida:', error instanceof Error ? error : new Error(String(error)));
        throw new Error('Error al generar URL firmada de subida');
    }
});
exports.generatePresignedUploadUrl = generatePresignedUploadUrl;
/**
 * Obtiene una imagen desde S3 y la devuelve como buffer
 * Función mejorada para servir imágenes directamente
 */
const getImageFromS3 = (key) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_2, _b, _c;
    try {
        const s3Client = yield getS3Client();
        const command = new client_s3_1.GetObjectCommand({
            Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
            Key: key,
        });
        const response = yield s3Client.send(command);
        if (!response.Body) {
            throw new Error('Archivo no encontrado');
        }
        // Convertir stream a buffer
        const chunks = [];
        try {
            for (var _d = true, _e = __asyncValues(response.Body), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                _c = _f.value;
                _d = false;
                const chunk = _c;
                chunks.push(chunk);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
            }
            finally { if (e_2) throw e_2.error; }
        }
        const buffer = Buffer.concat(chunks);
        const contentType = response.ContentType || 'image/jpeg';
        const size = response.ContentLength || buffer.length;
        loggerService_1.logger.info('[src/utils/idriveE2.ts] Imagen obtenida exitosamente desde S3:', {
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
    }
    catch (error) {
        loggerService_1.logger.error('[src/utils/idriveE2.ts] Error obteniendo imagen desde S3:', error instanceof Error ? error : new Error(String(error)));
        throw new Error('Error obteniendo imagen desde S3');
    }
});
exports.getImageFromS3 = getImageFromS3;
/**
 * Extrae la clave del archivo desde una URL de S3
 */
const extractKeyFromUrl = (url) => {
    try {
        const bucketName = process.env.IDRIVE_E2_BUCKET_NAME;
        if (!bucketName)
            return null;
        // Buscar la clave después del nombre del bucket
        const bucketIndex = url.indexOf(bucketName);
        if (bucketIndex === -1)
            return null;
        const keyStart = bucketIndex + bucketName.length + 1; // +1 para el slash
        return url.substring(keyStart);
    }
    catch (error) {
        loggerService_1.logger.error('[src/utils/idriveE2.ts] Error extrayendo clave de URL:', error instanceof Error ? error : new Error(String(error)));
        return null;
    }
};
exports.extractKeyFromUrl = extractKeyFromUrl;
/**
 * Lista objetos desde IDrive E2 con información detallada
 */
const listObjectsFromS3 = (prefix_1, ...args_1) => __awaiter(void 0, [prefix_1, ...args_1], void 0, function* (prefix, maxKeys = 1000) {
    try {
        const s3Client = yield getS3Client();
        const command = new client_s3_1.ListObjectsV2Command({
            Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
            Prefix: prefix,
            MaxKeys: maxKeys,
        });
        const response = yield s3Client.send(command);
        const objects = (response.Contents || []).map(obj => ({
            key: obj.Key,
            size: obj.Size || 0,
            lastModified: obj.LastModified || new Date(),
            etag: obj.ETag || '',
        }));
        loggerService_1.logger.info('[src/utils/idriveE2.ts] Objetos listados exitosamente desde S3:', {
            metadata: {
                bucket: process.env.IDRIVE_E2_BUCKET_NAME,
                prefix,
                totalObjects: objects.length,
                isTruncated: response.IsTruncated
            }
        });
        return {
            objects,
            isTruncated: response.IsTruncated || false,
            nextContinuationToken: response.NextContinuationToken,
        };
    }
    catch (error) {
        loggerService_1.logger.error('[src/utils/idriveE2.ts] Error listando objetos desde S3:', error instanceof Error ? error : new Error(String(error)));
        throw new Error('Error listando objetos desde S3');
    }
});
exports.listObjectsFromS3 = listObjectsFromS3;
/**
 * Lista todas las imágenes desde IDrive E2 con URLs firmadas
 */
const listImagesWithSignedUrls = (prefix_1, ...args_1) => __awaiter(void 0, [prefix_1, ...args_1], void 0, function* (prefix, maxKeys = 1000) {
    try {
        const { objects } = yield (0, exports.listObjectsFromS3)(prefix, maxKeys);
        // Filtrar solo archivos de imagen
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const imageObjects = objects.filter(obj => imageExtensions.some(ext => obj.key.toLowerCase().endsWith(ext)));
        // Generar URLs firmadas para cada imagen
        const imagesWithUrls = yield Promise.all(imageObjects.map((obj) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const signedUrl = yield (0, exports.generatePresignedUrl)(obj.key, 3600); // 1 hora
                // Extraer nombre de archivo y categoría
                const filename = obj.key.split('/').pop() || obj.key;
                const pathParts = obj.key.split('/');
                // La categoría está en la posición después de 'musikon-media'
                let category = 'general';
                if (pathParts.length > 2 && pathParts[0] === 'musikon-media') {
                    category = pathParts[1]; // deposits, profile, post, gallery, etc.
                }
                return {
                    key: obj.key,
                    url: signedUrl,
                    size: obj.size,
                    lastModified: obj.lastModified,
                    filename,
                    category,
                };
            }
            catch (error) {
                loggerService_1.logger.error('[src/utils/idriveE2.ts] Error generando URL firmada para:', error instanceof Error ? error : new Error(String(error)), { metadata: { key: obj.key } });
                return null;
            }
        })));
        // Filtrar objetos con errores
        const validImages = imagesWithUrls.filter(img => img !== null);
        loggerService_1.logger.info('[src/utils/idriveE2.ts] Imágenes con URLs firmadas generadas:', {
            metadata: {
                totalImages: validImages.length,
                totalObjects: objects.length
            }
        });
        return validImages;
    }
    catch (error) {
        loggerService_1.logger.error('[src/utils/idriveE2.ts] Error listando imágenes con URLs firmadas:', error instanceof Error ? error : new Error(String(error)));
        throw new Error('Error listando imágenes con URLs firmadas');
    }
});
exports.listImagesWithSignedUrls = listImagesWithSignedUrls;
// Cliente S3 legacy para compatibilidad (deprecated)
exports.s3 = new client_s3_1.S3Client({
    region: process.env.IDRIVE_E2_REGION,
    endpoint: process.env.IDRIVE_E2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.IDRIVE_E2_ACCESS_KEY,
        secretAccessKey: process.env.IDRIVE_E2_SECRET_KEY,
    },
    forcePathStyle: true,
});
