import type { Response, NextFunction } from "express";
import { PostService } from "../services/post.service.js";
import { StorageService } from "../storage/storage.service.js";
import { ClassRepository } from "../repositories/class.repository.js";
import type { AuthenticatedRequest } from "../types/index.js";
import {
  createPostSchema,
  updateCaptionSchema,
} from "../validators/post.validator.js";
import { reactionSchema } from "../validators/reaction.validator.js";
export class PostController {
  static async uploadPhoto(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { classId, base64, contentType } = req.body;
      if (!classId || !base64) {
        return res.status(400).json({
          ok: false,
          message: "classId and base64 image data are required",
        });
      }
      const isMember = await ClassRepository.isMember(classId, req.userId);
      if (!isMember) {
        return res.status(403).json({
          ok: false,
          message: "You must be a member of this class to upload photos",
        });
      }
      const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      const filePath = `${classId}/${req.userId}/${Date.now()}.jpg`;
      const uploadedPath = await StorageService.uploadPhoto(
        filePath,
        buffer,
        contentType || "image/jpeg",
      );
      let downloadUrl = uploadedPath;
      try {
        downloadUrl = await StorageService.createSignedDownloadUrl(uploadedPath, 86400 * 7);
      } catch {
        // fallback
      }
      return res.status(201).json({
        ok: true,
        photoPath: uploadedPath,
        downloadUrl,
      });
    } catch (err) {
      next(err);
    }
  }

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
      if ((err as Error).message?.includes("One photo per day")) {
        return res.status(409).json({
          ok: false,
          message: "You have already posted a photo today. Daily limit reached.",
        });
      }
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
  static async getClassFeed(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const classId = Array.isArray(req.params.classId) ? req.params.classId[0] : req.params.classId;
      const feed = await PostService.getClassFeed(classId, req.userId);
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

  // --- Comments ---

  static async createComment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
      const { content } = req.body;
      if (!content?.trim()) {
        return res.status(400).json({
          ok: false,
          message: "Comment content is required",
        });
      }
      const comment = await PostService.createComment(
        postId,
        req.userId,
        content.trim(),
        undefined, // parentId would come from route if needed
      );
      return res.status(201).json({ ok: true, comment });
    } catch (err) {
      next(err);
    }
  }

  static async getComments(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
      const comments = await PostService.getCommentsForPost(postId, req.userId);
      return res.json({ ok: true, comments });
    } catch (err) {
      next(err);
    }
  }

  static async updateComment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;
      const { content } = req.body;
      const comment = await PostService.updateComment(
        commentId,
        req.userId,
        content?.trim() || "",
      );
      return res.json({ ok: true, comment });
    } catch (err) {
      next(err);
    }
  }

  static async deleteComment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;
      await PostService.deleteComment(commentId, req.userId);
      return res.json({ ok: true, message: "Comment deleted" });
    } catch (err) {
      next(err);
    }
  }

  static async toggleCommentReaction(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;
      const { reactionType } = req.body;
      if (!reactionType) {
        return res.status(400).json({
          ok: false,
          message: "Reaction type is required",
        });
      }
      const result = await PostService.toggleCommentReaction(
        commentId,
        req.userId,
        reactionType as "heart" | "laugh" | "cry" | "fire" | "dead" | "respect",
      );
      return res.json({ ok: true, ...result });
    } catch (err) {
      next(err);
    }
  }
}