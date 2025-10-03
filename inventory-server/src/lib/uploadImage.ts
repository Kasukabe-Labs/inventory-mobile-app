import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import type { Multer } from "multer";

// S3 Config
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const BUCKET_NAME = process.env.AWS_S3_BUCKET!;

// helper: upload to S3
export async function uploadImageToS3(
  file: Express.Multer.File
): Promise<string> {
  const fileExt = path.extname(file.originalname);
  const fileName = `${uuidv4()}${fileExt}`;

  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: `products/${fileName}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3.send(new PutObjectCommand(uploadParams));

  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/products/${fileName}`;
}
