import { Router } from "express";

import { blockUser, getUsers, unblockUser, updateMe } from "./user.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { UserRole } from "./user.constants";
import { validate } from "../../middleware/validation.middleware";
import { updateUserSchema } from "./user.validation";


const router = Router();

// router.post("/register", validate(registerSchema), register);
// router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, validate(updateUserSchema), updateMe);
router.get("/", authenticate,authorize(UserRole.ADMIN), getUsers);
router.patch("/:userId/block", authenticate, authorize(UserRole.ADMIN), blockUser);
router.patch("/:userId/unblock", authenticate, authorize(UserRole.ADMIN), unblockUser);

export default router;
