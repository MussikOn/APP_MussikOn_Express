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
exports.uploadToS3 = exports.s3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
exports.s3 = new client_s3_1.S3Client({
    region: process.env.IDRIVE_E2_REGION,
    endpoint: process.env.IDRIVE_E2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.IDRIVE_E2_ACCESS_KEY,
        secretAccessKey: process.env.IDRIVE_E2_SECRET_KEY,
    },
    forcePathStyle: true,
});
/**
 * Sube un archivo a iDrive E2 (S3)
 */
const uploadToS3 = (file_1, fileName_1, contentType_1, ...args_1) => __awaiter(void 0, [file_1, fileName_1, contentType_1, ...args_1], void 0, function* (file, fileName, contentType, folder = 'uploads') {
    try {
        const key = `${folder}/${Date.now()}-${fileName}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: process.env.IDRIVE_E2_BUCKET,
            Key: key,
            Body: file,
            ContentType: contentType,
            ACL: 'private',
        });
        yield exports.s3.send(command);
        // Retorna la URL del archivo
        return `${process.env.IDRIVE_E2_ENDPOINT}/${process.env.IDRIVE_E2_BUCKET}/${key}`;
    }
    catch (error) {
        console.error('[functions/src/utils/idriveE2.ts] Error al subir archivo a S3:', error);
        throw new Error('Error al subir archivo a S3');
    }
});
exports.uploadToS3 = uploadToS3;
