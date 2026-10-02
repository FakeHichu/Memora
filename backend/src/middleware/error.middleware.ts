import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error("[API Error]:", err);

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    ok: false,
    message: err.message || "An unexpected internal error occurred",
  });
};
