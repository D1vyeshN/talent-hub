import multer from "multer";
import cloudinary from "../config/cloudinary";
import { Readable } from "stream";
import { ApiResponse } from "../utils/ApiResponse";

const storage = multer.memoryStorage();

/**
 * Upload a file buffer to Cloudinary using a stream.
 * Returns { url: string, publicId: string }.
 */
function uploadStream(
  buffer: Buffer,
  folder: string,
  options?: { transformation?: any; allowed_formats?: string[] }
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        ...options,
      } as any,
      (error: any, result: any) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary upload failed"));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    // Convert Buffer to Readable stream
    Readable.from(buffer).pipe(stream);
  });
}

const fileFilter = (_req: any, file: any, cb: any) => {
  if (!file.mimetype || file.mimetype === "application/octet-stream") {
    // For resume files where mimetype may not be reliable
    cb(null, true);
  } else {
    cb(null, true);
  }
};

export const uploadResume = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter,
});

export { uploadStream };
