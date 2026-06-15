import { Router } from "express";
import {
  register,
  login,
  getMe,
  logout,
} from "./auth.controller";
import { registerSchema, loginSchema } from "./auth.validator";
import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";

// ─── Router ───────────────────────────────────────────────────────────────────

const router = Router();

/**
 * @open — no auth required
 * @auth   — authenticate middleware required
 */

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", authenticate, getMe);
router.post("/logout", authenticate, logout);

// ─── Export ───────────────────────────────────────────────────────────────────

export default router;
