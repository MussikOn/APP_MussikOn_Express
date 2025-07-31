import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
    region: process.env.IDRIVE_E2_REGION,
    endpoint: process.env.IDRIVE_E2_ENDPOINT,
    credentials: {
    accessKeyId: process.env.IDRIVE_E2_ACCESS_KEY!,
    secretAccessKey: process.env.IDRIVE_E2_SECRET_KEY!,
  },
  forcePathStyle: true,
});
