/**
 * Vehicle Service
 *
 * Business logic layer for vehicle-related operations.
 * This service acts as an intermediary between the controllers and data access layer,
 * encapsulating all vehicle-related business rules and data operations.
 */

import { Vehicle } from "../types";
import { readVehicles, vehicleExists } from "../database";

/**
 * Retrieves all vehicles from the database
 *
 * @returns Array of all vehicles in the system
 *
 * @example
 * const vehicles = vehicleService.getAllVehicles();
 * console.log(`Found ${vehicles.length} vehicles`);
 */
export const getAllVehicles = (): Vehicle[] => {
  return readVehicles();
};

/**
 * Checks if a vehicle exists in the database
 *
 * @param vehicleId - The unique identifier of the vehicle to check
 * @returns true if the vehicle exists, false otherwise
 *
 * @example
 * if (vehicleService.checkVehicleExists('VH001')) {
 *   console.log('Vehicle found!');
 * }
 */
export const checkVehicleExists = (vehicleId: string): boolean => {
  return vehicleExists(vehicleId);
};

/**
 * Finds a specific vehicle by its ID
 *
 * @param vehicleId - The unique identifier of the vehicle
 * @returns The vehicle object if found, undefined otherwise
 *
 * @example
 * const vehicle = vehicleService.getVehicleById('VH001');
 * if (vehicle) {
 *   console.log(`Found ${vehicle.make} ${vehicle.model}`);
 * }
 */
export const getVehicleById = (vehicleId: string): Vehicle | undefined => {
  const vehicles = readVehicles();
  return vehicles.find((v) => v.id === vehicleId);
};
