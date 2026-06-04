import { Router } from "express";
import * as RecruiterController from "./recruiter.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";

const router = Router();

// Recruiter own routes
router.get("/me",          authenticate, authorizeRoles("recruiter"), RecruiterController.getMyProfile);
router.put("/me",          authenticate, authorizeRoles("recruiter"), RecruiterController.updateProfile);
router.patch("/me/company",authenticate, authorizeRoles("recruiter"), RecruiterController.assignCompany);

// Public
router.get("/:id",         authenticate, RecruiterController.getRecruiterById);

// Admin only
router.get("/",            authenticate, authorizeRoles("admin"), RecruiterController.getAllRecruiters);

export default router;