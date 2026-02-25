/**
 * Routes Index
 *
 * Central hub for all application routes.
 * This file aggregates and exports all route modules, making it easy
 * to register them in the main server file.
 */

import { Router } from "express";
import vehicleRoutes from "./vehicleRoutes";
import checkRoutes from "./checkRoutes";

const router = Router();

/**
 * Mount all route modules
 *
 * /vehicles - Vehicle-related endpoints
 * /checks - Inspection check endpoints
 */
router.use("/vehicles", vehicleRoutes);
router.use("/checks", checkRoutes);

export default router;
