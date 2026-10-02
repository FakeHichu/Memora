import type { Response, NextFunction } from "express";

import { ClassService } from "../services/class.service.js";
import type { AuthenticatedRequest } from "../types/index.js";
import {
  createClassSchema,
  joinClassSchema,
} from "../validators/class.validator.js";

export class ClassController {
  static async createClass(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const parsed = createClassSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          ok: false,
          message: "Invalid class payload",
          errors: parsed.error.flatten(),
        });
      }

      const created = await ClassService.createClass(
        parsed.data.name,
        parsed.data.schoolName ?? null,
        parsed.data.academicYear,
        req.userId,
      );

      return res.status(201).json({ ok: true, class: created });
    } catch (err) {
      next(err);
    }
  }

  static async joinClass(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const parsed = joinClassSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          ok: false,
          message: "Invalid join code format",
          errors: parsed.error.flatten(),
        });
      }

      const result = await ClassService.joinClassByCode(
        parsed.data.joinCode,
        req.userId,
      );
      return res.json({
        ok: true,
        class: result.classEntity,
        member: result.member,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getUserClasses(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const classes = await ClassService.getUserClasses(req.userId);
      return res.json({ ok: true, classes });
    } catch (err) {
      next(err);
    }
  }

  static async getClassDetails(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const classId = Array.isArray(req.params.classId) ? req.params.classId[0] : req.params.classId;
      const classEntity = await ClassService.getClassDetails(
        classId,
        req.userId,
      );
      return res.json({ ok: true, class: classEntity });
    } catch (err) {
      next(err);
    }
  }

  static async getClassMembers(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const classId = Array.isArray(req.params.classId) ? req.params.classId[0] : req.params.classId;
      const members = await ClassService.getClassMembers(classId, req.userId);
      return res.json({ ok: true, members });
    } catch (err) {
      next(err);
    }
  }
}
