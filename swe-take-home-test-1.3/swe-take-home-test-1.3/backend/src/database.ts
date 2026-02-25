/**
 * Database Module
 *
 * This module provides data access functions for reading and writing to JSON files
 * that serve as the application's data store. It abstracts file system operations
 * and provides a simple interface for data persistence.
 *
 * In a production environment, this would be replaced with a proper database
 * like PostgreSQL, MongoDB, or MySQL. The interface remains the same, making
 * the transition easier.
 */

import fs from "fs";
import path from "path";
import { Vehicle, Check } from "./types";

// Define paths to data files
const VEHICLES_FILE = path.join(__dirname, "data", "vehicles.json");
const CHECKS_FILE = path.join(__dirname, "data", "checks.json");

/**
 * Reads all vehicles from the JSON data file
 *
 * This function synchronously reads the vehicles.json file and parses it
 * into an array of Vehicle objects. If the file cannot be read or parsed,
 * it logs the error and returns an empty array.
 *
 * @returns Array of all vehicles in the system, or empty array if read fails
 *
 * @example
 * const vehicles = readVehicles();
 * console.log(`Found ${vehicles.length} vehicles`);
 */
export const readVehicles = (): Vehicle[] => {
  try {
    const data = fs.readFileSync(VEHICLES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading vehicles file:", error);
    return [];
  }
};

/**
 * Reads all inspection checks from the JSON data file
 *
 * This function synchronously reads the checks.json file and parses it
 * into an array of Check objects. If the file cannot be read or parsed,
 * it logs the error and returns an empty array.
 *
 * @returns Array of all checks in the system, or empty array if read fails
 *
 * @example
 * const checks = readChecks();
 * const latestCheck = checks[checks.length - 1];
 */
export const readChecks = (): Check[] => {
  try {
    const data = fs.readFileSync(CHECKS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading checks file:", error);
    return [];
  }
};

/**
 * Writes the array of checks to the JSON data file
 *
 * This function synchronously writes the provided checks array to the
 * checks.json file with pretty-printing (2 space indentation). If the
 * write operation fails, it logs the error and re-throws it.
 *
 * @param checks - Array of Check objects to persist
 * @throws Error if the file cannot be written
 *
 * @example
 * const checks = readChecks();
 * checks.push(newCheck);
 * writeChecks(checks);
 */
export const writeChecks = (checks: Check[]): void => {
  try {
    fs.writeFileSync(CHECKS_FILE, JSON.stringify(checks, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing checks file:", error);
    throw error;
  }
};

/**
 * Checks if a vehicle exists in the system
 *
 * This function searches through all vehicles to determine if one
 * with the specified ID exists. This is useful for validation before
 * creating checks or performing other vehicle-related operations.
 *
 * @param vehicleId - The unique identifier of the vehicle to check
 * @returns true if a vehicle with the given ID exists, false otherwise
 *
 * @example
 * if (vehicleExists('VH001')) {
 *   console.log('Vehicle exists, proceeding with check creation');
 * } else {
 *   console.error('Vehicle not found');
 * }
 */
export const vehicleExists = (vehicleId: string): boolean => {
  const vehicles = readVehicles();
  return vehicles.some((v) => v.id === vehicleId);
};
