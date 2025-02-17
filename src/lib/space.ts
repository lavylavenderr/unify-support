import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env";

export const s3Client = new S3Client({
    endpoint: env.R2_ENDPOINT,
    forcePathStyle: false,
    region: 'us-east-1',
    credentials: {
        accessKeyId: env.R2_ACCESSKEY,
        secretAccessKey: env.R2_SECRETKEY,
    }
})
