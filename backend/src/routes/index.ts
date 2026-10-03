import { Router } from "express";

import { classRoutes } from "./class.routes.js";
import { postRoutes } from "./post.routes.js";
import { promptRoutes } from "./prompt.routes.js";

const router = Router();

router.use("/classes", classRoutes);
router.use("/posts", postRoutes);
router.use("/prompts", promptRoutes);

export const apiRoutes = router;
