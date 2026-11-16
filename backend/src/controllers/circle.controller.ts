import type { Response, NextFunction } from "express";
import { CircleService } from "../services/circle.service.js";
import { StorageService } from "../storage/storage.service.js";
import type { AuthenticatedRequest } from "../types/index.js";

export class CircleController {
  // Create a new circle within a class
  static async createCircle(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { classId, name, description } = req.body;
      if (!classId || !name?.trim()) {
        return res.status(400).json({
          ok: false,
          message: "classId and name are required",
        });
      }

      const circle = await CircleService.createCircle(
        classId,
        req.userId,
        name.trim(),
        description?.trim() || null,
      );

      return res.status(201).json({ ok: true, circle });
    } catch (err) {
      next(err);
    }
  }

  // Get all circles for the current user
  static async getUserCircles(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const circles = await CircleService.getUserCircles(req.userId);
      return res.json({ ok: true, circles });
    } catch (err) {
      next(err);
    }
  }

  // Get circles within a specific class
  static async getCirclesByClass(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const classId = Array.isArray(req.params.classId)
        ? req.params.classId[0]
        : req.params.classId;
      const circles = await CircleService.getCirclesByClass(classId, req.userId);
      return res.json({ ok: true, circles });
    } catch (err) {
      next(err);
    }
  }

  // Join a circle
  static async joinCircle(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const circleId = Array.isArray(req.params.circleId)
        ? req.params.circleId[0]
        : req.params.circleId;
      await CircleService.joinCircle(circleId, req.userId);
      return res.json({ ok: true, message: "Successfully joined circle" });
    } catch (err) {
      next(err);
    }
  }

  // Upload photo to circle
  static async uploadPhotoToCircle(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { circleId, base64, contentType, caption } = req.body;
      if (!circleId || !base64) {
        return res.status(400).json({
          ok: false,
          message: "circleId and base64 image data are required",
        });
      }

      const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");
      const filePath = `circles/${circleId}/${req.userId}/${Date.now()}.jpg`;
      const uploadedPath = await StorageService.uploadPhoto(
        filePath,
        buffer,
        contentType || "image/jpeg",
      );

      const post = await CircleService.createCirclePost(
        circleId,
        req.userId,
        uploadedPath,
        caption?.trim() || null,
      );

      let downloadUrl = uploadedPath;
      try {
        downloadUrl = await StorageService.createSignedDownloadUrl(uploadedPath, 86400 * 7);
      } catch {
        // fallback
      }

      return res.status(201).json({
        ok: true,
        post,
        photoPath: uploadedPath,
        downloadUrl,
      });
    } catch (err) {
      next(err);
    }
  }

  // Get circle feed (all posts in a circle)
  static async getCircleFeed(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const circleId = Array.isArray(req.params.circleId)
        ? req.params.circleId[0]
        : req.params.circleId;
      const feed = await CircleService.getCircleFeed(circleId, req.userId);
      return res.json({ ok: true, ...feed });
    } catch (err) {
      next(err);
    }
  }

  // Update circle post caption
  static async updatePostCaption(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const postId = Array.isArray(req.params.postId)
        ? req.params.postId[0]
        : req.params.postId;
      const { caption } = req.body;
      const post = await CircleService.updatePostCaption(
        postId,
        req.userId,
        caption?.trim() || null,
      );
      return res.json({ ok: true, post });
    } catch (err) {
      next(err);
    }
  }

  // Delete circle post
  static async deletePost(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const postId = Array.isArray(req.params.postId)
        ? req.params.postId[0]
        : req.params.postId;
      await CircleService.deletePost(postId, req.userId);
      return res.json({ ok: true, message: "Post successfully deleted" });
    } catch (err) {
      next(err);
    }
  }

  // Toggle reaction on circle post
  static async toggleReaction(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const postId = Array.isArray(req.params.postId)
        ? req.params.postId[0]
        : req.params.postId;
      const { reactionType } = req.body;
      if (!reactionType) {
        return res.status(400).json({
          ok: false,
          message: "reactionType is required",
        });
      }
      const result = await CircleService.toggleReaction(postId, req.userId, reactionType);
      return res.json({ ok: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  // Set user's active circle
  static async setActiveCircle(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { circleId } = req.body;
      if (!circleId) {
        return res.status(400).json({
          ok: false,
          message: "circleId is required",
        });
      }
      await CircleService.setActiveCircle(req.userId, circleId);
      return res.json({ ok: true, message: "Active circle set" });
    } catch (err) {
      next(err);
    }
  }

  // Get user's active circle
  static async getActiveCircle(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const circle = await CircleService.getActiveCircle(req.userId);
      return res.json({ ok: true, circle });
    } catch (err) {
      next(err);
    }
  }
}
