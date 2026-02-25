/**
 * Error Handler Middleware
 *
 * Centralized error handling middleware for the Express application.
 * Catches and formats errors consistently across all routes.
 */

import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "../types";

/**
 * Global error handler middleware
 *
 * This middleware catches errors thrown in route handlers and formats them
 * into a consistent error response structure. It should be registered as
 * the last middleware in the Express application.
 *
 * @param err - The error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Error:", err);

  const errorResponse: ErrorResponse = {
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: err.message || "An unexpected error occurred",
      details: [],
    },
  };

  res.status(500).json(errorResponse);
};
