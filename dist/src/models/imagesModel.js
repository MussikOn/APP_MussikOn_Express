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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateImageMetadata = exports.deleteImage = exports.uploadImage = exports.getImageUrl = exports.listImages = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const s3 = new aws_sdk_1.default.S3({
    endpoint: process.env.IDRIVE_E2_ENDPOINT,
    accessKeyId: process.env.IDRIVE_E2_ACCESS_KEY,
    secretAccessKey: process.env.IDRIVE_E2_SECRET_KEY,
});
const BUCKET = process.env.IDRIVE_E2_BUCKET_NAME;
const listImages = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield s3.listObjectsV2({
            Bucket: BUCKET,
            MaxKeys: 1000,
        }).promise();
        if (!response.Contents)
            return [];
        return response.Contents.map(item => ({
            key: item.Key,
            lastModified: item.LastModified,
            size: item.Size,
        }));
    }
    catch (error) {
        throw error;
    }
});
exports.listImages = listImages;
const getImageUrl = (key) => {
    return s3.getSignedUrl("getObject", {
        Bucket: BUCKET,
        Key: key,
        Expires: 60 * 60, // 1 hora
    });
};
exports.getImageUrl = getImageUrl;
const uploadImage = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const key = Date.now() + "_" + file.originalname;
    yield s3.putObject({
        Bucket: BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    }).promise();
    return { key, url: (0, exports.getImageUrl)(key) };
});
exports.uploadImage = uploadImage;
const deleteImage = (key) => __awaiter(void 0, void 0, void 0, function* () {
    yield s3.deleteObject({
        Bucket: BUCKET,
        Key: key,
    }).promise();
    return true;
});
exports.deleteImage = deleteImage;
const updateImageMetadata = (key, metadata) => __awaiter(void 0, void 0, void 0, function* () {
    // S3 no permite actualizar metadata directamente, hay que copiar el objeto sobre sí mismo
    const copySource = `${BUCKET}/${key}`;
    yield s3.copyObject({
        Bucket: BUCKET,
        CopySource: copySource,
        Key: key,
        Metadata: metadata,
        MetadataDirective: "REPLACE",
    }).promise();
    return true;
});
exports.updateImageMetadata = updateImageMetadata;
