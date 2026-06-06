import cloudinary from "../config/cloudinary";

export interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string = "company-logos"
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: folder,
        transformation: [
          { width: 500, height: 500, crop: "limit" },
          { quality: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result) {
          reject(new Error("Upload failed"));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    ).end(file.buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};
