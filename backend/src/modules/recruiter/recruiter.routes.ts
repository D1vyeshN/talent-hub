import { Router } from "express";
import * as RecruiterController from "./recruiter.controller";
import * as RecruiterService from "./recruiter.service";
import { authenticate } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
import { uploadAvatar, uploadStream } from "../../middleware/upload.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";

const router = Router();

// Recruiter own routes
router.get("/me",          authenticate, authorizeRoles("recruiter"), RecruiterController.getMyProfile);
router.put("/me",          authenticate, authorizeRoles("recruiter"), RecruiterController.updateProfile);
router.patch("/me/company",authenticate, authorizeRoles("recruiter"), RecruiterController.assignCompany);

// Avatar upload
router.post(
  "/me/avatar",
  authenticate,
  authorizeRoles("recruiter"),
  uploadAvatar.single("avatar"),
  asyncHandler(async (req: any, res: any) => {
    if (!req.file) throw new Error("No file uploaded");
    const { url } = await uploadStream(req.file.buffer, "avatars");
    await RecruiterService.updateRecruiterProfile(req.userId!, { avatar: url });
    res.json(new ApiResponse(200, { avatar: url }, "Avatar uploaded"));
  })
);

// Public
router.get("/:id",         authenticate, RecruiterController.getRecruiterById);

// Admin only
router.get("/",            authenticate, authorizeRoles("admin"), RecruiterController.getAllRecruiters);

export default router;