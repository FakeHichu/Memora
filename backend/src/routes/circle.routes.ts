import { Router, type RequestHandler } from "express";
import { CircleController } from "../controllers/circle.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// All circle routes require authentication
router.use(requireAuth);

// Circle management
router.post("/", CircleController.createCircle as unknown as RequestHandler);
router.get("/", CircleController.getUserCircles as unknown as RequestHandler);
router.get("/class/:classId", CircleController.getCirclesByClass as unknown as RequestHandler);
router.post("/:circleId/join", CircleController.joinCircle as unknown as RequestHandler);

// Active circle tracking
router.post("/active", CircleController.setActiveCircle as unknown as RequestHandler);
router.get("/active", CircleController.getActiveCircle as unknown as RequestHandler);

// Circle posts
router.post("/upload", CircleController.uploadPhotoToCircle as unknown as RequestHandler);
router.get("/:circleId/feed", CircleController.getCircleFeed as unknown as RequestHandler);
router.patch("/posts/:postId/caption", CircleController.updatePostCaption as unknown as RequestHandler);
router.delete("/posts/:postId", CircleController.deletePost as unknown as RequestHandler);

// Reactions
router.post("/posts/:postId/reactions", CircleController.toggleReaction as unknown as RequestHandler);

export default router;
