import { Router } from "express";
import * as CompanyController from "./company.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
import { uploadAvatar } from "../../middleware/upload.middleware";

const router = Router();

// Public
router.get("/",    CompanyController.getAllCompanies);
router.get("/:id", CompanyController.getCompanyById);

// Recruiter
router.post(
  "/",
  authenticate,
  authorizeRoles("recruiter"),
  CompanyController.createCompany
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("recruiter"),
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