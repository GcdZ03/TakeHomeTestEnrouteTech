/**
 * Vehicle Routes
 *
 * Defines all HTTP routes related to vehicle operations.
 * Routes are organized in a modular way, separated from the main server file
 * to improve maintainability and testability.
 */

import { Router } from "express";
import * as vehicleController from "../controllers/vehicleController";

const router = Router();

/**
 * GET /vehicles
 * Retrieve all vehicles
 */
router.get("/", vehicleController.getAllVehicles);

export default router;
