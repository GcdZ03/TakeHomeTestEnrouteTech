/**
 * Validation Module
 *
 * This module handles request validation for API endpoints. It provides
 * comprehensive validation functions that check request data against
 * business rules and return detailed error messages.
 */

import { CheckItemKey, ValidationError } from "./types";
import { vehicleExists } from "./database";

/**
 * Valid check item keys that must be included in every inspection
 */
const VALID_KEYS: CheckItemKey[] = [
  "TYRES",
  "BRAKES",
  "LIGHTS",
  "OIL",
  "COOLANT",
];

/**
 * Valid status values for each check item
 */
const VALID_STATUSES = ["OK", "FAIL"];

/**
 * Validates a check creation request
 *
 * This function performs comprehensive validation on the request body for
 * creating a new vehicle inspection check. It validates:
 * - vehicleId exists and is valid
 * - odometerKm is a positive number
 * - items array contains exactly 5 items with all required keys
 * - Each item has a valid key and status
 * - No duplicate keys are present
 * - Optional note field is within character limit
 *
 * @param body - The request body to validate (untyped to allow validation)
 * @returns Array of validation errors (empty if validation passes)
 *
 * @example
 * const errors = validateCheckRequest(req.body);
 * if (errors.length > 0) {
 *   return res.status(400).json({ errors });
 * }
 *
 * @example
 * // Valid request
 * const validBody = {
 *   vehicleId: "VH001",
 *   odometerKm: 15000,
 *   items: [
 *     { key: "TYRES", status: "OK" },
 *     { key: "BRAKES", status: "OK" },
 *     { key: "LIGHTS", status: "OK" },
 *     { key: "OIL", status: "OK" },
 *     { key: "COOLANT", status: "OK" }
 *   ],
 *   note: "All systems operational"
 * };
 * validateCheckRequest(validBody); // Returns []
 *
 * @example
 * // Invalid request
 * const invalidBody = {
 *   vehicleId: "INVALID",
 *   odometerKm: -100,
 *   items: []
 * };
 * validateCheckRequest(invalidBody); // Returns multiple errors
 */
export const validateCheckRequest = (body: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate vehicleId
  if (!body.vehicleId) {
    errors.push({ field: "vehicleId", reason: "is required" });
  } else if (typeof body.vehicleId !== "string") {
    errors.push({ field: "vehicleId", reason: "must be a string" });
  } else if (!vehicleExists(body.vehicleId)) {
    errors.push({ field: "vehicleId", reason: "vehicle does not exist" });
  }

  // Validate odometerKm
  if (body.odometerKm === undefined || body.odometerKm === null) {
    errors.push({ field: "odometerKm", reason: "is required" });
  } else if (typeof body.odometerKm !== "number") {
    errors.push({ field: "odometerKm", reason: "must be a number" });
  } else if (body.odometerKm <= 0) {
    errors.push({ field: "odometerKm", reason: "must be > 0" });
  }

  // Validate items array
  if (!body.items) {
    errors.push({ field: "items", reason: "is required" });
  } else if (!Array.isArray(body.items)) {
    errors.push({ field: "items", reason: "must be an array" });
  } else {
    // Check array length
    if (body.items.length !== 5) {
      errors.push({ field: "items", reason: "must contain exactly 5 items" });
    }

    // Track keys to check for duplicates and missing keys
    const keys = new Set<string>();

    // Validate each individual item
    body.items.forEach((item: any, index: number) => {
      if (!item.key) {
        errors.push({ field: `items[${index}].key`, reason: "is required" });
      } else if (!VALID_KEYS.includes(item.key)) {
        errors.push({
          field: `items[${index}].key`,
          reason: `must be one of: ${VALID_KEYS.join(", ")}`,
        });
      } else {
        keys.add(item.key);
      }

      if (!item.status) {
        errors.push({ field: `items[${index}].status`, reason: "is required" });
      } else if (!VALID_STATUSES.includes(item.status)) {
        errors.push({
          field: `items[${index}].status`,
          reason: `must be one of: ${VALID_STATUSES.join(", ")}`,
        });
      }
    });

    // Check for duplicate keys
    if (body.items.length === 5 && keys.size !== 5) {
      errors.push({
        field: "items",
        reason: "must contain all 5 keys exactly once (no duplicates)",
      });
    }

    // Check that all required keys are present
    VALID_KEYS.forEach((key) => {
      if (!keys.has(key)) {
        errors.push({ field: "items", reason: `missing required key: ${key}` });
      }
    });
  }

  // Validate optional note field
  if (body.note !== undefined && body.note !== null) {
    if (typeof body.note !== "string") {
      errors.push({ field: "note", reason: "must be a string" });
    } else if (body.note.length > 300) {
      errors.push({ field: "note", reason: "must be <= 300 characters" });
    }
  }

  return errors;
};
