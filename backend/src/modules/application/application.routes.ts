import { Router } from "express";
import * as ApplicationController from "./application.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";

const router = Router();

// Candidate routes
router.post(
  "/",
  authenticate,
  authorizeRoles("candidate"),
  ApplicationController.applyToJob
);

router.get(
  "/my",
  authenticate,
  authorizeRoles("candidate"),
  ApplicationController.getMyApplications
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("candidate"),
  ApplicationController.withdrawApplication
);

// Recruiter routes
router.get(
  "/job/:jobId",
  authenticate,
  authorizeRoles("recruiter"),
  ApplicationController.getJobApplications
);

router.get(
  '/company/:companyId', 
  authenticate, 
  authorizeRoles("recruiter"),
  ApplicationController.getCompanyApplications
);

router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("recruiter"),
  ApplicationController.updateStatus
);

// Shared (candidate sees their own, recruiter sees for their jobs)
router.get(
  "/:id",
  authenticate,
  ApplicationController.getApplicationById
);

// Recruiter analytics
router.get(
  "/stats/recruiter",
  authenticate,
  authorizeRoles("recruiter"),
  ApplicationController.getApplicationStats
);

export default router;