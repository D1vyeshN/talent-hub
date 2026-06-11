import { Router } from "express";
import * as NotificationController from "./notification.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, NotificationController.getMyNotifications);
router.get("/unread-count", authenticate, NotificationController.getUnreadCount);
router.patch("/:id/read", authenticate, NotificationController.markAsRead);
router.patch("/read-all", authenticate, NotificationController.markAllRead);
router.delete("/:id", authenticate, NotificationController.deleteNotification);

export default router;