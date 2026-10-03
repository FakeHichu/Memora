import type { RequestHandler } from "express";

import { supabase } from "../lib/supabase.js";
import type { AuthenticatedRequest } from "../types/index.js";

export const requireAuth: RequestHandler = async (req, res, next) => {
  const authorization = req.header("authorization");
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!accessToken) {
    res
      .status(401)
      .json({ ok: false, message: "Authorization bearer token is required" });
    return;
  }

  if (!supabase) {
    res
      .status(503)
      .json({ ok: false, message: "Backend Supabase is not configured" });
    return;
  }

  try {
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      res
        .status(401)
        .json({ ok: false, message: "Access token is invalid or expired" });
      return;
    }

    (req as AuthenticatedRequest).userId = data.user.id;
    next();
  } catch {
    res
      .status(503)
      .json({ ok: false, message: "Could not verify authorization" });
  }
};
