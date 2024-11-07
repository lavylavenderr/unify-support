import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env";

export const s3Client = new S3Client({
    endpoint: "https://sfo2.digitaloceanspaces.com",
    forcePathStyle: false,
    region: 'us-east-1',
    credentials: {
        accessKeyId: env.DIGITALOCEAN_SPACEKEY,
        secretAccessKey: env.DIGITALOCEAN_SPACEKEY_PRIV
    }
})