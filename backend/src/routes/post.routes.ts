import { Router, type RequestHandler } from "express";

import { PostController } from "../controllers/post.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.post("/", PostController.createPost as unknown as RequestHandler);
router.patch(
  "/:postId",
  PostController.updateCaption as unknown as RequestHandler,
);
router.delete(
  "/:postId",
  PostController.deletePost as unknown as RequestHandler,
);
router.post(
  "/:postId/reactions",
  PostController.toggleReaction as unknown as RequestHandler,
);

export const postRoutes = router;
