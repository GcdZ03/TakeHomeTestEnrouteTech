/**
 * Check Routes
 *
 * Defines all HTTP routes related to vehicle inspection check operations.
 * These routes handle the creation and retrieval of inspection checks.
 */

import { Router } from "express";
import * as checkController from "../controllers/checkController";

const router = Router();

/**
 * POST /checks
 * Create a new inspection check
 */
router.post("/", checkController.createCheck);

/**
 * GET /checks
 * Retrieve checks with optional filters
 */
router.get("/", checkController.getChecks);

/**
 * DELETE /checks/:id
 * Delete a specific inspection check
 */
router.delete("/:id", checkController.deleteCheck);

export default router;
