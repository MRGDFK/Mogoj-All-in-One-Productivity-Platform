import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env.js";

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL } = env;

// null when R2 isn't fully configured; callers must respond 503.
export const r2 =
  R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME && R2_PUBLIC_URL
    ? {
        client: new S3Client({
          region: "auto",
          endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
          credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
        }),
        bucket: R2_BUCKET_NAME,
        publicUrl: R2_PUBLIC_URL,
      }
    : null;
