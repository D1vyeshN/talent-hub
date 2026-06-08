import multer from "multer";
// @ts-ignore - Type declaration exists in src/types/multer-storage-cloudinary.d.ts
import CloudinaryStorage from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

const resumeStorage = CloudinaryStorage({
  cloudinary,
  params: {
    folder: "resumes",
    allowed_formats: ["pdf", "doc", "docx"],
  } as Record<string, unknown>,
});

const avatarStorage = CloudinaryStorage({
  cloudinary,
  params: {
    folder: "avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 300, height: 300, crop: "fill" }],
  } as Record<string, unknown>,
});

export const uploadResume = multer({ storage: resumeStorage });
export const uploadAvatar = multer({ storage: avatarStorage });