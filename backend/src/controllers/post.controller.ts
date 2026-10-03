import type { Response, NextFunction } from "express";

import { PostService } from "../services/post.service.js";
import type { AuthenticatedRequest } from "../types/index.js";
import {
  createPostSchema,
  updateCaptionSchema,
} from "../validators/post.validator.js";
import { reactionSchema } from "../validators/reaction.validator.js";

export class PostController {
  static async createPost(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const parsed = createPostSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          ok: false,
          message: "Invalid post data",
          errors: parsed.error.flatten(),
        });
      }

      const post = await PostService.createDailyPost(
        parsed.data.classId,
        req.userId,
        parsed.data.photoPath,
        parsed.data.caption,
        parsed.data.promptId,
      );

      return res.status(201).json({ ok: true, post });
    } catch (err) {
      next(err);
    }
  }

  static async getTodayFeed(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const classId = Array.isArray(req.params.classId) ? req.params.classId[0] : req.params.classId;
      const feed = await PostService.getTodayFeed(classId, req.userId);
      return res.json({ ok: true, ...feed });
    } catch (err) {
      next(err);
    }
  }

  static async updateCaption(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
      const parsed = updateCaptionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          ok: false,
          message: "Invalid caption format",
          errors: parsed.error.flatten(),
        });
      }

      const updated = await PostService.updateCaption(
        postId,
        req.userId,
        parsed.data.caption,
      );
      return res.json({ ok: true, post: updated });
    } catch (err) {
      next(err);
    }
  }

  static async deletePost(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
      await PostService.deletePost(postId, req.userId);
      return res.json({ ok: true, message: "Post successfully deleted" });
    } catch (err) {
      next(err);
    }
  }

  static async toggleReaction(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
      const parsed = reactionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          ok: false,
          message: "Invalid reaction type",
          errors: parsed.error.flatten(),
        });
      }

      const result = await PostService.toggleReaction(
        postId,
        req.userId,
        parsed.data.reactionType,
      );
      return res.json({ ok: true, ...result });
    } catch (err) {
      next(err);
    }
  }
}
