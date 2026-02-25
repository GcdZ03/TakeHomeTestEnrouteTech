/**
 * Check Controller
 *
 * Handles HTTP requests and responses for vehicle inspection check endpoints.
 * This controller manages the creation and retrieval of inspection checks,
 * including validation and error handling.
 */

import { Request, Response } from "express";
import * as checkService from "../services/checkService";
import { validateCheckRequest } from "../validation";
import { ErrorResponse } from "../types";

/**
 * POST /checks
 *
 * Creates a new vehicle inspection check.
 *
 * This endpoint:
 * - Validates the request body
 * - Creates a new check with computed fields (hasIssue, createdAt)
 * - Returns the created check with a 201 status code
 *
 * @param req - Express request object containing check data in body
 * @param res - Express response object
 *
 * @returns JSON response with created check or validation errors
 */
export const createCheck = (req: Request, res: Response): void => {
  res.status(501).json({ error: { message: "Not implemented" } });
};

/**
 * GET /checks
 *
 * Retrieves vehicle inspection checks with filtering options.
 *
 * This endpoint:
 * - Requires vehicleId as a query parameter
 * - Optionally filters by hasIssue flag
 * - Returns checks sorted by creation date (newest first)
 *
 * @param req - Express request object with query parameters
 * @param res - Express response object
 *
 * @returns JSON response with array of checks matching the filters
 *
 * @example
 * GET /checks?vehicleId=VH001
 * Returns all checks for vehicle VH001
 *
 * @example
 * GET /checks?vehicleId=VH001&hasIssue=true
 * Returns only checks with issues for vehicle VH001
 *
 * @example
 * Success Response (200 OK):
 * [
 *   {
 *     "id": "CHK001",
 *     "vehicleId": "VH001",
 *     "odometerKm": 15420,
 *     "items": [...],
 *     "hasIssue": false,
 *     "createdAt": "2026-01-20T08:30:00.000Z"
 *   },
 *   ...
 * ]
 *
 * @example
 * Error Response (400 Bad Request):
 * {
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "Invalid request",
 *     "details": [
 *       { "field": "vehicleId", "reason": "is required" }
 *     ]
 *   }
 * }
 */
export const getChecks = (req: Request, res: Response): void => {
  const { vehicleId, hasIssue } = req.query;

  // Validate vehicleId is provided and is a string
  if (!vehicleId || typeof vehicleId !== "string") {
    const errorResponse: ErrorResponse = {
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request",
        details: [{ field: "vehicleId", reason: "is required" }],
      },
    };
    res.status(400).json(errorResponse);
    return;
  }

  // Parse hasIssue parameter and build filters
  const filters: checkService.CheckFilters =
    hasIssue !== undefined
      ? { vehicleId, hasIssue: hasIssue === "true" }
      : { vehicleId };

  // Retrieve checks from service layer
  const checks = checkService.getChecks(filters);

  res.json(checks);
};

/**
 * DELETE /checks/:id
 *
 * Deletes a specific inspection check by its ID.
 *
 * @param req - Express request object with check ID in params
 * @param res - Express response object
 *
 * @returns 204 No Content on success, 404 if check not found
 */
export const deleteCheck = (req: Request, res: Response): void => {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    const errorResponse: ErrorResponse = {
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request",
        details: [{ field: "id", reason: "is required" }],
      },
    };
    res.status(400).json(errorResponse);
    return;
  }

  res.status(501).json({ error: { message: "Not completed" } });
};
