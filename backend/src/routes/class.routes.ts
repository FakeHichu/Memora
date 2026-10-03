import { Router, type RequestHandler } from "express";

import { ClassController } from "../controllers/class.controller.js";
import { PostController } from "../controllers/post.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.post("/", ClassController.createClass as unknown as RequestHandler);
router.post("/join", ClassController.joinClass as unknown as RequestHandler);
router.get("/", ClassController.getUserClasses as unknown as RequestHandler);
router.get(
  "/:classId",
  ClassController.getClassDetails as unknown as RequestHandler,
);
router.get(
  "/:classId/members",
  ClassController.getClassMembers as unknown as RequestHandler,
);
router.get(
  "/:classId/feed/today",
  PostController.getTodayFeed as unknown as RequestHandler,
);

export const classRoutes = router;
