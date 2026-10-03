import { Router, type RequestHandler } from "express";

import { PromptController } from "../controllers/prompt.controller.js";

const router = Router();

router.get(
  "/today",
  PromptController.getTodayPrompt as unknown as RequestHandler,
);

export const promptRoutes = router;
