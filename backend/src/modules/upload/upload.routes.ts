import { Router } from "express";
import { uploadImage } from "./upload.controller";
import { authenticate } from "../../middleware/auth.middleware";
import multer from "multer";

const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

router.post("/image", authenticate, upload.single("file"), uploadImage);

export default router;
