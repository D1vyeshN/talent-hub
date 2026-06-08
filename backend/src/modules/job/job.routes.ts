import { Router } from "express";
import * as JobController from "./job.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";

const router = Router();

// Public (with optional auth for recruiter context)
router.get("/", authenticate, JobController.getJobs);
router.get("/:id", JobController.getJobById);

// Recruiter only
router.post("/", authenticate, authorizeRoles("recruiter"), JobController.createJob);
router.put("/:id", authenticate, authorizeRoles("recruiter"), JobController.updateJob);
router.delete("/:id", authenticate, authorizeRoles("recruiter", "admin"), JobController.deleteJob);

// Admin only
router.patch("/:id/feature", authenticate, authorizeRoles("admin"), JobController.toggleFeature);

export default router;