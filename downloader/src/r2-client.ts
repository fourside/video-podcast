import { readFile } from "node:fs/promises";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Env } from "./env.ts";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${Env.cloudflare.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: Env.cloudflare.accessKeyId,
    secretAccessKey: Env.cloudflare.secretAccessKey,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

export async function uploadToR2(
  filePath: string,
  key: string,
  metadata: Record<string, string>,
): Promise<void> {
  const body = await readFile(filePath);
  const command = new PutObjectCommand({
    Bucket: Env.cloudflare.bucketName,
    Key: key,
    Body: body,
    ContentType: "video/mp4",
    Metadata: metadata,
  });
  await s3.send(command);
  console.log(`Uploaded to R2: ${key}`);
}
