import type { Request } from "express";
import multer, { type FileFilterCallback } from "multer";

// --- Multer memory storage for AWS S3 ---
const storage = multer.memoryStorage();

// --- File type filter (only images) ---
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."));
  }
};

// --- Export the configured multer instance ---
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
