import { Router } from "express";
import * as CompanyController from "./company.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
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

// Public
router.get("/",    CompanyController.getAllCompanies);
router.get("/:id", CompanyController.getCompanyById);

// Recruiter
router.post(
  "/",
  authenticate,
  authorizeRoles("recruiter"),
  upload.single("logo"),
  CompanyController.createCompany
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("recruiter"),
  upload.single("logo"),
  CompanyController.updateCompany
);

// Recruiter or Admin
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("recruiter", "admin"),
  CompanyController.deleteCompany
);

export default router;