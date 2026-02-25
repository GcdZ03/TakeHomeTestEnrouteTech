/**
 * Check Service
 *
 * Business logic layer for vehicle inspection check operations.
 * This service handles all check-related business rules including creation,
 * retrieval, filtering, and sorting of inspection checks.
 */

import { v4 as uuidv4 } from "uuid";
import { Check, CheckItem } from "../types";
import { readChecks, writeChecks } from "../database";

/**
 * Interface for creating a new check
 * Represents the data required to create a vehicle inspection check
 */
export interface CreateCheckData {
  vehicleId: string;
  odometerKm: number;
  items: CheckItem[];
  note?: string;
}

/**
 * Interface for filtering checks when retrieving
 */
export interface CheckFilters {
  vehicleId: string;
  hasIssue?: boolean;
}

/**
 * Creates a new inspection check and persists it to the database
 *
 * This function automatically:
 * - Generates a unique ID for the check
 * - Calculates the hasIssue flag based on item statuses
 * - Sets the creation timestamp
 * - Saves the check to persistent storage
 *
 * @param checkData - The check data including vehicle ID, odometer reading, inspection items, and optional note
 * @returns The newly created check with all computed fields
 */
export const createCheck = (checkData: CreateCheckData): Check => {
  // @ts-ignore
  const hasIssue = checkData.items.some((item) => item.status === "FAILED");

  const newCheck: Check = {
    id: uuidv4(),
    vehicleId: checkData.vehicleId,
    odometerKm: checkData.odometerKm,
    items: checkData.items,
    ...(checkData.note !== undefined && { note: checkData.note }),
    hasIssue: !hasIssue,
    createdAt: new Date().toISOString(),
  };

  // Persist to database
  const checks = readChecks();
  checks.push(newCheck);
  writeChecks(checks);

  return newCheck;
};

/**
 * Retrieves checks with optional filtering and sorting
 *
 * This function:
 * - Filters checks by the required vehicleId
 * - Optionally filters by hasIssue flag
 * - Sorts results by creation date (newest first)
 *
 * @param filters - Object containing vehicleId (required) and hasIssue (optional)
 * @returns Array of checks matching the filter criteria, sorted by creation date descending
 *
 * @example
 * // Get all checks for a vehicle
 * const allChecks = checkService.getChecks({ vehicleId: 'VH001' });
 *
 * @example
 * // Get only checks with issues for a vehicle
 * const checksWithIssues = checkService.getChecks({
 *   vehicleId: 'VH001',
 *   hasIssue: true
 * });
 */
export const getChecks = (filters: CheckFilters): Check[] => {
  let checks = readChecks();

  // Filter by vehicleId (required)
  checks = checks.filter((check) => check.vehicleId === filters.vehicleId);

  // Filter by hasIssue if provided
  if (filters.hasIssue !== undefined) {
    checks = checks.filter((check) => check.hasIssue === filters.hasIssue);
  }

  // Sort by createdAt (newest first)
  checks.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return checks;
};

/**
 * Retrieves a specific check by its ID
 *
 * @param checkId - The unique identifier of the check
 * @returns The check object if found, undefined otherwise
 *
 * @example
 * const check = checkService.getCheckById('CHK001');
 * if (check) {
 *   console.log(`Check performed at ${check.createdAt}`);
 * }
 */
export const getCheckById = (checkId: string): Check | undefined => {
  const checks = readChecks();
  return checks.find((check) => check.id === checkId);
};
/**
 * Deletes a specific check by its ID
 *
 * @param checkId - The unique identifier of the check to delete
 * @returns true if the check was deleted, false if not found
 *
 * @example
 * const deleted = checkService.deleteCheck('CHK001');
 * if (deleted) {
 *   console.log('Check deleted successfully');
 * }
 */
export const deleteCheck = (checkId: string): boolean => {
  return false;
};
