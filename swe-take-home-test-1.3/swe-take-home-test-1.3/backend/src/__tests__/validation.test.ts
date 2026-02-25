/**
 * Validation Tests
 *
 * Unit tests for request validation functions.
 * These tests ensure that all validation rules are correctly enforced.
 */

import { validateCheckRequest } from "../validation";
import * as database from "../database";

// Mock the database module
jest.mock("../database");

describe("Validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: vehicle exists
    (database.vehicleExists as jest.Mock).mockReturnValue(true);
  });

  describe("validateCheckRequest", () => {
    const validBody = {
      vehicleId: "VH001",
      odometerKm: 15000,
      items: [
        { key: "TYRES", status: "OK" },
        { key: "BRAKES", status: "OK" },
        { key: "LIGHTS", status: "OK" },
        { key: "OIL", status: "OK" },
        { key: "COOLANT", status: "OK" },
      ],
      note: "All systems operational",
    };

    describe("Valid requests", () => {
      it("should return no errors for valid request", () => {
        const errors = validateCheckRequest(validBody);
        expect(errors).toEqual([]);
      });

      it("should accept request without optional note", () => {
        const { note, ...bodyWithoutNote } = validBody;
        const errors = validateCheckRequest(bodyWithoutNote);
        expect(errors).toEqual([]);
      });

      it("should accept FAIL status", () => {
        const body = {
          ...validBody,
          items: [
            { key: "TYRES", status: "FAIL" },
            { key: "BRAKES", status: "OK" },
            { key: "LIGHTS", status: "OK" },
            { key: "OIL", status: "OK" },
            { key: "COOLANT", status: "OK" },
          ],
        };
        const errors = validateCheckRequest(body);
        expect(errors).toEqual([]);
      });
    });

    describe("vehicleId validation", () => {
      it("should return error when vehicleId is missing", () => {
        const { vehicleId, ...body } = validBody;
        const errors = validateCheckRequest(body);

        expect(errors).toContainEqual({
          field: "vehicleId",
          reason: "is required",
        });
      });

      it("should return error when vehicleId is not a string", () => {
        const body = { ...validBody, vehicleId: 123 };
        const errors = validateCheckRequest(body);

        expect(errors).toContainEqual({
          field: "vehicleId",
          reason: "must be a string",
        });
      });

      it("should return error when vehicle does not exist", () => {
        (database.vehicleExists as jest.Mock).mockReturnValue(false);

        const errors = validateCheckRequest(validBody);

        expect(errors).toContainEqual({
          field: "vehicleId",
          reason: "vehicle does not exist",
        });
      });
    });

    describe("odometerKm validation", () => {
      it("should return error when odometerKm is missing", () => {
        const { odometerKm, ...body } = validBody;
        const errors = validateCheckRequest(body);

        expect(errors).toContainEqual({
          field: "odometerKm",
          reason: "is required",
        });
      });

      it("should return error when odometerKm is not a number", () => {
        const body = { ...validBody, odometerKm: "15000" };
        const errors = validateCheckRequest(body);

        expect(errors).toContainEqual({
          field: "odometerKm",
          reason: "must be a number",
        });
      });

      it("should return error when odometerKm is zero", () => {
        const body = { ...validBody, odometerKm: 0 };
        const errors = validateCheckRequest(body);

        expect(errors).toContainEqual({
          field: "odometerKm",
          reason: "must be > 0",
        });
      });

      it("should return error when odometerKm is negative", () => {
        const body = { ...validBody, odometerKm: -100 };
        const errors = validateCheckRequest(body);

        expect(errors).toContainEqual({
          field: "odometerKm",
          reason: "must be > 0",
        });
      });
    });

    describe("items validation", () => {
      it("should return error when items is missing", () => {
        const { items, ...body } = validBody;
        const errors = validateCheckRequest(body);

        expect(errors).toContainEqual({
          field: "items",
          reason: "is required",
        });
      });

      it("should return error when items is not an array", () => {
        const body = { ...validBody, items: "not an array" };
        const errors = validateCheckRequest(body);

        expect(errors).toContainEqual({
          field: "items",
          reason: "must be an array",
        });
      });

      it("should return error when items has wrong length", () => {
        const body = {
          ...validBody,
          items: [
            { key: "TYRES", status: "OK" },
            { key: "BRAKES", status: "OK" },
          ],
        };
        const errors = validateCheckRequest(body);

        expect(errors).toContainEqual({
          field: "items",
          reason: "must contain exactly 5 items",
        });
      });

      it("should return error when item key is missing", () => {
        const body = {
          ...validBody,
          items: [
            { status: "OK" },
            { key: "BRAKES", status: "OK" },
            { key: "LIGHTS", status: "OK" },
            { key: "OIL", status: "OK" },
            { key: "COOLANT", status: "OK" },
          ],
        };
        const errors = validateCheckRequest(body);

        expect(errors).toContainEqual({
          field: "items[0].key",
          reason: "is required",
        });
      });

      it("should return error when item key is invalid", () => {
        const body = {
          ...validBody,
          items: [
            { key: "INVALID", status: "OK" },
            { key: "BRAKES", status: "OK" },
            { key: "LIGHTS", status: "OK" },
            { key: "OIL", status: "OK" },
            { key: "COOLANT", status: "OK" },
          ],
        };
        const errors = validateCheckRequest(body);

        expect(errors.some((e) => e.field === "items[0].key")).toBe(true);
      });

      it("should return error when item status is missing", () => {
        const body = {
          ...validBody,
          items: [
            { key: "TYRES" },
            { key: "BRAKES", status: "OK" },
            { key: "LIGHTS", status: "OK" },
            { key: "OIL", status: "OK" },
            { key: "COOLANT", status: "OK" },
          ],
        };
        const errors = validateCheckRequest(body);

        expect(errors).toContainEqual({
          field: "items[0].status",
          reason: "is required",
        });
      });

      it("should return error when item status is invalid", () => {
        const body = {
          ...validBody,
          items: [
            { key: "TYRES", status: "MAYBE" },
            { key: "BRAKES", status: "OK" },
            { key: "LIGHTS", status: "OK" },
            { key: "OIL", status: "OK" },
            { key: "COOLANT", status: "OK" },
          ],
        };
        const errors = validateCheckRequest(body);

        expect(errors.some((e) => e.field === "items[0].status")).toBe(true);
      });

      it("should return error when duplicate keys exist", () => {
        const body = {
          ...validBody,
          items: [
            { key: "TYRES", status: "OK" },
            { key: "TYRES", status: "OK" },
            { key: "LIGHTS", status: "OK" },
            { key: "OIL", status: "OK" },
            { key: "COOLANT", status: "OK" },
          ],
        };
        const errors = validateCheckRequest(body);

        expect(errors.some((e) => e.reason.includes("no duplicates"))).toBe(
          true,
        );
      });

      it("should return error when required key is missing", () => {
        const body = {
          ...validBody,
          items: [
            { key: "TYRES", status: "OK" },
            { key: "BRAKES", status: "OK" },
            { key: "LIGHTS", status: "OK" },
            { key: "OIL", status: "OK" },
            { key: "OIL", status: "OK" }, // Duplicate instead of COOLANT
          ],
        };
        const errors = validateCheckRequest(body);

        expect(errors.some((e) => e.reason.includes("COOLANT"))).toBe(true);
      });
    });

    describe("note validation", () => {
      it("should return error when note is not a string", () => {
        const body = { ...validBody, note: 123 };
        const errors = validateCheckRequest(body);

        expect(errors).toContainEqual({
          field: "note",
          reason: "must be a string",
        });
      });

      it("should return error when note exceeds max length", () => {
        const body = { ...validBody, note: "a".repeat(301) };
        const errors = validateCheckRequest(body);

        expect(errors).toContainEqual({
          field: "note",
          reason: "must be <= 300 characters",
        });
      });

      it("should accept note at exactly 300 characters", () => {
        const body = { ...validBody, note: "a".repeat(300) };
        const errors = validateCheckRequest(body);

        expect(errors).toEqual([]);
      });
    });

    describe("Multiple errors", () => {
      it("should return multiple errors for invalid request", () => {
        const body = {
          vehicleId: 123,
          odometerKm: -50,
          items: [],
        };
        const errors = validateCheckRequest(body);

        expect(errors.length).toBeGreaterThan(1);
      });
    });
  });
});
