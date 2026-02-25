/**
 * Vehicle Controller
 *
 * Handles HTTP requests and responses for vehicle-related endpoints.
 * Controllers are responsible for:
 * - Extracting data from HTTP requests
 * - Calling appropriate service layer functions
 * - Formatting and sending HTTP responses
 */

import { Request, Response } from "express";
import * as vehicleService from "../services/vehicleService";

/**
 * GET /vehicles
 *
 * Retrieves and returns all vehicles in the system.
 *
 * @param req - Express request object
 * @param res - Express response object
 *
 * @returns JSON response with array of vehicles
 *
 * @example
 * Response (200 OK):
 * [
 *   {
 *     "id": "VH001",
 *     "registration": "ABC123",
 *     "make": "Toyota",
 *     "model": "Hilux",
 *     "year": 2022
 *   },
 *   ...
 * ]
 */
export const getAllVehicles = (req: Request, res: Response): void => {
  const vehicles = vehicleService.getAllVehicles();
  res.json(vehicles);
};
