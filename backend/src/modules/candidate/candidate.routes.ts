import { Router } from "express";
import * as CandidateController from "./candidate.controller";
import * as CandidateService from "./candidate.service";
import { authenticate } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
import { uploadResume, uploadAvatar, uploadStream } from "../../middleware/upload.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";

const router = Router();

// Candidate own routes
router.get("/me", authenticate, authorizeRoles("candidate"), CandidateController.getMyProfile);
router.put("/me", authenticate, authorizeRoles("candidate"), CandidateController.updateProfile);
router.post("/me/save-job/:jobId", authenticate, authorizeRoles("candidate"), CandidateController.saveJob);
router.delete("/me/save-job/:jobId", authenticate, authorizeRoles("candidate"), CandidateController.unsaveJob);

// Upload resume (buffer → Cloudinary stream)
router.post(
  "/me/resume",
  authenticate,
  authorizeRoles("candidate"),
  uploadResume.single("resume"),
  asyncHandler(async (req: any, res: any) => {
    if (!req.file) throw new Error("No file uploaded");
    const { url } = await uploadStream(req.file.buffer, "resumes", {
      allowed_formats: ["pdf", "doc", "docx"],
    });
    await CandidateService.updateCandidateProfile(req.userId!, { resumeUrl: url });
    res.json(new ApiResponse(200, { resumeUrl: url }, "Resume uploaded"));
  })
);

// Upload avatar (buffer → Cloudinary stream)
router.post(
  "/me/avatar",
  authenticate,
  authorizeRoles("candidate"),
  uploadAvatar.single("avatar"),
  asyncHandler(async (req: any, res: any) => {
    if (!req.file) throw new Error("No file uploaded");
    const { url } = await uploadStream(req.file.buffer, "avatars");
    await CandidateService.updateCandidateProfile(req.userId!, { avatar: url });
    res.json(new ApiResponse(200, { avatar: url }, "Avatar uploaded"));
  })
);

// Skills management
router.post(
  "/me/skills",
  authenticate,
  authorizeRoles("candidate"),
  asyncHandler(async (req: any, res: any) => {
    const { skill } = req.body;
    if (!skill) throw new Error("Skill is required");
    const candidate = await CandidateService.addSkill(req.userId!, skill);
    res.json(new ApiResponse(200, candidate, "Skill added"));
  })
);

router.delete(
  "/me/skills/:skill",
  authenticate,
  authorizeRoles("candidate"),
  asyncHandler(async (req: any, res: any) => {
    const { skill } = req.params;
    const candidate = await CandidateService.removeSkill(req.userId!, skill as string);
    res.json(new ApiResponse(200, candidate, "Skill removed"));
  })
);

// Education management
router.post(
  "/me/education",
  authenticate,
  authorizeRoles("candidate"),
  asyncHandler(async (req: any, res: any) => {
    const education = req.body;
    if (!education.degree || !education.institution || !education.year) {
      throw new Error("Degree, institution, and year are required");
    }
    const candidate = await CandidateService.addEducation(req.userId!, education);
    res.json(new ApiResponse(200, candidate, "Education added"));
  })
);

router.delete(
  "/me/education/:educationId",
  authenticate,
  authorizeRoles("candidate"),
  asyncHandler(async (req: any, res: any) => {
    const { educationId } = req.params;
    const candidate = await CandidateService.removeEducation(req.userId!, educationId);
    res.json(new ApiResponse(200, candidate, "Education removed"));
  })
);

// Work experience management
router.post(
  "/me/experience",
  authenticate,
  authorizeRoles("candidate"),
  asyncHandler(async (req: any, res: any) => {
    const experience = req.body;
    if (!experience.title || !experience.company || !experience.startDate) {
      throw new Error("Title, company, and start date are required");
    }
    const candidate = await CandidateService.addWorkExperience(req.userId!, experience);
    res.json(new ApiResponse(200, candidate, "Work experience added"));
  })
);

router.delete(
  "/me/experience/:experienceId",
  authenticate,
  authorizeRoles("candidate"),
  asyncHandler(async (req: any, res: any) => {
    const { experienceId } = req.params;
    const candidate = await CandidateService.removeWorkExperience(req.userId!, experienceId);
    res.json(new ApiResponse(200, candidate, "Work experience removed"));
  })
);

// Admin only
router.get("/", authenticate, authorizeRoles("admin"), CandidateController.getAllCandidates);

export default router;
