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
exports.s3 = exports.generatePresignedUploadUrl = exports.generatePresignedUrl = exports.getFileInfo = exports.fileExistsInS3 = exports.deleteFromS3 = exports.downloadFromS3 = exports.uploadToS3 = void 0;
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
 * Sube un archivo a iDrive E2 (S3) con manejo automático de tokens
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
            ACL: 'public-read', // Cambiar a público para que las imágenes sean accesibles
        });
        yield s3Client.send(command);
        // Generar URL más confiable
        let fileUrl;
        // Si el endpoint termina en .com, usar formato de URL estándar
        if (process.env.IDRIVE_E2_ENDPOINT.includes('.com')) {
            fileUrl = `https://${process.env.IDRIVE_E2_BUCKET_NAME}.${process.env.IDRIVE_E2_ENDPOINT.replace('https://', '')}/${key}`;
        }
        else {
            // Usar formato de endpoint personalizado
            fileUrl = `${process.env.IDRIVE_E2_ENDPOINT}/${process.env.IDRIVE_E2_BUCKET_NAME}/${key}`;
        }
        loggerService_1.logger.info('[src/utils/idriveE2.ts] Archivo subido exitosamente:', {
            metadata: {
                bucket: process.env.IDRIVE_E2_BUCKET_NAME,
                key,
                url: fileUrl
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
