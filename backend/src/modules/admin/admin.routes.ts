import { Router } from "express";
import * as AdminController from "./admin.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";

const router = Router();

// All admin routes are protected
router.use(authenticate, authorizeRoles("admin"));

router.get("/dashboard",                AdminController.getDashboard);
router.post("/create-admin",            AdminController.createAdmin);
router.patch("/companies/:id/verify",   AdminController.verifyCompany);
router.patch("/jobs/:id/feature",       AdminController.toggleFeature);
router.patch("/users/:id/ban",          AdminController.toggleUserBan);

export default router;