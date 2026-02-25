/**
 * Type Definitions
 *
 * This module contains all TypeScript type definitions and interfaces used
 * throughout the backend application. These types provide compile-time type
 * safety and improve code documentation.
 */

/**
 * Vehicle Interface
 *
 * Represents a vehicle in the fleet that can be inspected.
 * Each vehicle has a unique identifier, registration number, and basic details.
 */
export interface Vehicle {
  /** Unique identifier for the vehicle (e.g., "VH001") */
  id: string;
  /** Vehicle registration/license plate number (e.g., "ABC123") */
  registration: string;
  /** Vehicle manufacturer (e.g., "Toyota", "Ford") */
  make: string;
  /** Vehicle model name (e.g., "Hilux", "Ranger") */
  model: string;
  /** Year the vehicle was manufactured */
  year: number;
}

/**
 * Check Item Key Type
 *
 * Defines the valid inspection point keys. These are the specific components
 * that must be checked during every vehicle inspection.
 */
export type CheckItemKey = "TYRES" | "BRAKES" | "LIGHTS" | "OIL" | "COOLANT";

/**
 * Check Item Status Type
 *
 * Defines the possible outcomes for each inspection item.
 * - OK: The component passed inspection
 * - FAIL: The component failed inspection and needs attention
 */
export type CheckItemStatus = "OK" | "FAIL";

/**
 * Check Item Interface
 *
 * Represents a single inspection point within a vehicle check.
 * Each check must include exactly 5 items, one for each required key.
 */
export interface CheckItem {
  /** The component being checked (TYRES, BRAKES, etc.) */
  key: CheckItemKey;
  /** The result of the inspection (OK or FAIL) */
  status: CheckItemStatus;
}

/**
 * Check Interface
 *
 * Represents a complete vehicle inspection check. This includes all inspection
 * items, metadata about the inspection, and computed flags.
 */
export interface Check {
  /** Unique identifier for the check (UUID format) */
  id: string;
  /** ID of the vehicle that was inspected */
  vehicleId: string;
  /** Odometer reading at the time of inspection (in kilometers) */
  odometerKm: number;
  /** Array of 5 inspection items, one for each required component */
  items: CheckItem[];
  /** Optional notes or comments about the inspection */
  note?: string;
  /** Flag indicating if any items failed (computed from items array) */
  hasIssue: boolean;
  /** ISO 8601 timestamp of when the check was created */
  createdAt: string;
}

/**
 * Validation Error Interface
 *
 * Represents a single validation error that occurred during request validation.
 * Multiple validation errors can be returned in a single response.
 */
export interface ValidationError {
  /** The field name that failed validation (e.g., "odometerKm", "items[0].key") */
  field: string;
  /** Human-readable explanation of why validation failed */
  reason: string;
}

/**
 * Error Response Interface
 *
 * Standard error response structure used across all API endpoints.
 * Provides consistent error formatting for client applications.
 */
export interface ErrorResponse {
  error: {
    /** Machine-readable error code (e.g., "VALIDATION_ERROR", "NOT_FOUND") */
    code: string;
    /** Human-readable error message */
    message: string;
    /** Array of specific validation errors (may be empty for non-validation errors) */
    details: ValidationError[];
  };
}
