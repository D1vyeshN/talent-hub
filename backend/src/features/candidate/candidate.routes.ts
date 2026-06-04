import { Router } from "express";
import * as CandidateController from "./candidate.controller";
import { authenticate, AuthRequest } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
import { uploadResume } from "@/middleware/upload.middleware";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/ApiResponse";


const router = Router();

// Candidate own routes
router.get("/me", authenticate, authorizeRoles("candidate"), CandidateController.getMyProfile);
router.put("/me", authenticate, authorizeRoles("candidate"), CandidateController.updateProfile);
router.post("/me/save-job/:jobId", authenticate, authorizeRoles("candidate"), CandidateController.saveJob);
router.delete("/me/save-job/:jobId", authenticate, authorizeRoles("candidate"), CandidateController.unsaveJob);

// Upload resume
router.post(
  "/me/resume",
  authenticate,
  authorizeRoles("candidate"),
  uploadResume.single("resume"),
//   asyncHandler(async (req: AuthRequest, res: Response) => {
//     const file = req.file as Express.Multer.File & { path: string };
//     await CandidateService.updateCandidateProfile(req.userId, { resumeUrl: file.path });
//     res.json(new ApiResponse(200, { resumeUrl: file.path }, "Resume uploaded"));
//   })
);

// Admin only
router.get("/", authenticate, authorizeRoles("admin"), CandidateController.getAllCandidates);

export default router;