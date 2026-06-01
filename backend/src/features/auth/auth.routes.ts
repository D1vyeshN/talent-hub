import { Router } from "express";
import {
  register,
  login,
  getMe,
  logout,
} from "./auth.controller";
import { registerValidation, loginValidation } from "./auth.validator";
import { authenticate } from "@/middleware/auth.middleware";

// ─── Router ───────────────────────────────────────────────────────────────────

const router = Router();

/**
 * @open — no auth required
 * @auth   — authenticate middleware required
 */

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/me", authenticate, getMe);
router.post("/logout", authenticate, logout);

// ─── Export ───────────────────────────────────────────────────────────────────

export default router;
