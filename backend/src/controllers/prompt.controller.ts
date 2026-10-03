import type { Request, Response, NextFunction } from "express";

import { PromptService } from "../services/prompt.service.js";

export class PromptController {
  static async getTodayPrompt(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const prompt = await PromptService.getTodayPrompt();
      return res.json({ ok: true, prompt });
    } catch (err) {
      next(err);
    }
  }
}
