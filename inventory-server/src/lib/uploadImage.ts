import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
import bwipjs from "bwip-js";

// S3 Config
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const BUCKET_NAME = process.env.AWS_S3_BUCKET!;

/**
 * Upload product image to S3
 * Saves in: products/{sku}/image.{ext}
 */
export async function uploadImageToS3(
  file: Express.Multer.File,
  sku: string
): Promise<string> {
  const fileExt = path.extname(file.originalname);
  const fileName = `image${fileExt}`;

  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: `products/${sku}/${fileName}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3.send(new PutObjectCommand(uploadParams));

  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/products/${sku}/${fileName}`;
}

/**
 * Generate barcode from SKU + price + quantity and upload to S3
 * Saves in: products/{sku}/barcode.png
 */
export async function generateAndUploadBarcode(
  sku: string,
  price: number,
  quantity: number
): Promise<string> {
  try {
    const barcodeText = `SKU:${sku} | Price:${price} | Qty:${quantity}`;

    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: "code128",
      text: barcodeText,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: "center",
    });

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: `products/${sku}/barcode.png`,
      Body: barcodeBuffer,
      ContentType: "image/png",
    };

    await s3.send(new PutObjectCommand(uploadParams));

    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/products/${sku}/barcode.png`;
  } catch (error) {
    console.error("Error generating barcode:", error);
    throw new Error("Failed to generate barcode");
  }
}

/**
 * Generate barcode preview (base64 data URL)
 * Frontend preview before saving
 */
export async function generateBarcodePreview(
  sku: string,
  price: number,
  quantity: number
): Promise<string> {
  try {
    const barcodeText = `SKU:${sku} | Price:${price} | Qty:${quantity}`;

    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: "code128",
      text: barcodeText,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: "center",
    });

    return `data:image/png;base64,${barcodeBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Error generating barcode preview:", error);
    throw new Error("Failed to generate barcode preview");
  }
}
