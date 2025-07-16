import AWS from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();

const s3 = new AWS.S3({
    endpoint: process.env.IDRIVE_E2_ENDPOINT,
    accessKeyId: process.env.IDRIVE_E2_ACCESS_KEY,
    secretAccessKey: process.env.IDRIVE_E2_SECRET_KEY,
});
const BUCKET = process.env.IDRIVE_E2_BUCKET_NAME;

export const listImages = async () => {
    try {
        const response = await s3.listObjectsV2({
            Bucket: BUCKET!,
            MaxKeys: 1000,
        }).promise();
        if (!response.Contents) return [];
        return response.Contents.map(item => ({
            key: item.Key,
            lastModified: item.LastModified,
            size: item.Size,
        }));
    } catch (error) {
        throw error;
    }
};

export const getImageUrl = (key: string) => {
    return s3.getSignedUrl("getObject", {
        Bucket: BUCKET!,
        Key: key,
        Expires: 60 * 60, // 1 hora
    });
};

export const uploadImage = async (file: Express.Multer.File) => {
    const key = Date.now() + "_" + file.originalname;
    await s3.putObject({
        Bucket: BUCKET!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    }).promise();
    return { key, url: getImageUrl(key) };
};

export const deleteImage = async (key: string) => {
    await s3.deleteObject({
        Bucket: BUCKET!,
        Key: key,
    }).promise();
    return true;
};

export const updateImageMetadata = async (key: string, metadata: Record<string, string>) => {
    // S3 no permite actualizar metadata directamente, hay que copiar el objeto sobre sí mismo
    const copySource = `${BUCKET}/${key}`;
    await s3.copyObject({
        Bucket: BUCKET!,
        CopySource: copySource,
        Key: key,
        Metadata: metadata,
        MetadataDirective: "REPLACE",
    }).promise();
    return true;
};