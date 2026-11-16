import { Router } from "express";
import { classRoutes } from "./class.routes.js";
import { postRoutes } from "./post.routes.js";
import { promptRoutes } from "./prompt.routes.js";
import circleRoutes from "./circle.routes.js";

const router = Router();

router.use("/classes", classRoutes);
router.use("/posts", postRoutes);
router.use("/daily-posts", postRoutes);
router.use("/prompts", promptRoutes);
router.use("/circles", circleRoutes);

export const apiRoutes = router;