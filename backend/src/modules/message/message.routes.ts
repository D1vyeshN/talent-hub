import { Router } from "express";
import * as MessageController from "./message.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get("/conversations",                              MessageController.getMyConversations);
router.get("/conversations/:conversationId",             MessageController.getMessages);
router.patch("/conversations/:conversationId/read",      MessageController.markAsRead);
router.post("/",                                         MessageController.sendMessage);

export default router;