import { S3Client } from "@aws-sdk/client-s3";

export const strClient = new S3Client({
  endpoint: Bun.env.STR_ENDPOINT,
  forcePathStyle: false,
  region: "us-east-1",
  credentials: {
    accessKeyId: Bun.env.STR_ACCESSKEY,
    secretAccessKey: Bun.env.STR_SECRETKEY,
  },
});
