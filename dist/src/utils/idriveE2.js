"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3 = void 0;
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
