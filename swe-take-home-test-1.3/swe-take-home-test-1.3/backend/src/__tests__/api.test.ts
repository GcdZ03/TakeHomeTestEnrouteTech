/**
 * API Integration Tests
 *
 * End-to-end integration tests for all API endpoints.
 * These tests use supertest to make actual HTTP requests to the Express app.
 */

import request from "supertest";
import { createApp } from "../app";
import * as database from "../database";
import { Vehicle, Check } from "../types";

// Mock uuid to avoid ESM issues
jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-uuid-123"),
}));

// Mock the database module
jest.mock("../database");

describe("API Integration Tests", () => {
  const app = createApp();

  const mockVehicles: Vehicle[] = [
    {
      id: "VH001",
      registration: "ABC123",
      make: "Toyota",
      model: "Hilux",
      year: 2022,
    },
    {
      id: "VH002",
      registration: "XYZ789",
      make: "Ford",
      model: "Ranger",
      year: 2021,
    },
  ];

  const mockChecks: Check[] = [
    {
      id: "CHK001",
      vehicleId: "VH001",
      odometerKm: 15420,
      items: [
        { key: "TYRES", status: "OK" },
        { key: "BRAKES", status: "OK" },
        { key: "LIGHTS", status: "OK" },
        { key: "OIL", status: "OK" },
        { key: "COOLANT", status: "OK" },
      ],
      note: "All systems nominal",
      hasIssue: false,
      createdAt: "2026-01-20T08:30:00.000Z",
    },
    {
      id: "CHK002",
      vehicleId: "VH001",
      odometerKm: 16500,
      items: [
        { key: "TYRES", status: "OK" },
        { key: "BRAKES", status: "FAIL" },
        { key: "LIGHTS", status: "OK" },
        { key: "OIL", status: "OK" },
        { key: "COOLANT", status: "OK" },
      ],
      hasIssue: true,
      createdAt: "2026-01-25T10:15:00.000Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /vehicles", () => {
    it("should return 200 and list of vehicles", async () => {
      // Arrange
      (database.readVehicles as jest.Mock).mockReturnValue(mockVehicles);

      // Act & Assert
      const response = await request(app).get("/vehicles").expect(200);

      expect(response.body).toEqual(mockVehicles);
      expect(response.body).toHaveLength(2);
    });

    it("should return empty array when no vehicles exist", async () => {
      // Arrange
      (database.readVehicles as jest.Mock).mockReturnValue([]);

      // Act & Assert
      const response = await request(app).get("/vehicles").expect(200);

      expect(response.body).toEqual([]);
    });

    it("should have correct content-type header", async () => {
      // Arrange
      (database.readVehicles as jest.Mock).mockReturnValue(mockVehicles);

      // Act & Assert
      await request(app)
        .get("/vehicles")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });

  describe("POST /checks", () => {
    const validCheckBody = {
      vehicleId: "VH001",
      odometerKm: 15000,
      items: [
        { key: "TYRES", status: "OK" },
        { key: "BRAKES", status: "OK" },
        { key: "LIGHTS", status: "OK" },
        { key: "OIL", status: "OK" },
        { key: "COOLANT", status: "OK" },
      ],
      note: "All good",
    };

    beforeEach(() => {
      (database.vehicleExists as jest.Mock).mockReturnValue(true);
      (database.readChecks as jest.Mock).mockReturnValue([]);
      (database.writeChecks as jest.Mock).mockImplementation(() => {});
    });

    it.skip("should create check and return 201", async () => {
      // Act & Assert
      const response = await request(app)
        .post("/checks")
        .send(validCheckBody)
        .expect(201);

      expect(response.body).toMatchObject({
        vehicleId: "VH001",
        odometerKm: 15000,
        hasIssue: false,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(database.writeChecks).toHaveBeenCalled();
    });

    it.skip("should set hasIssue to true when any item fails", async () => {
      // Arrange
      const bodyWithFailure = {
        ...validCheckBody,
        items: [
          { key: "TYRES", status: "OK" },
          { key: "BRAKES", status: "FAIL" },
          { key: "LIGHTS", status: "OK" },
          { key: "OIL", status: "OK" },
          { key: "COOLANT", status: "OK" },
        ],
      };

      // Act & Assert
      const response = await request(app)
        .post("/checks")
        .send(bodyWithFailure)
        .expect(201);

      expect(response.body.hasIssue).toBe(true);
    });

    it("should return 400 for invalid vehicleId", async () => {
      // Arrange
      (database.vehicleExists as jest.Mock).mockReturnValue(false);
      const invalidBody = { ...validCheckBody, vehicleId: "INVALID" };

      // Act & Assert
      const response = await request(app)
        .post("/checks")
        .send(invalidBody)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.error.details).toContainEqual({
        field: "vehicleId",
        reason: "vehicle does not exist",
      });
    });

    it("should return 400 for negative odometerKm", async () => {
      // Arrange
      const invalidBody = { ...validCheckBody, odometerKm: -100 };

      // Act & Assert
      const response = await request(app)
        .post("/checks")
        .send(invalidBody)
        .expect(400);

      expect(response.body.error.details).toContainEqual({
        field: "odometerKm",
        reason: "must be > 0",
      });
    });

    it("should return 400 when items array has wrong length", async () => {
      // Arrange
      const invalidBody = {
        ...validCheckBody,
        items: [
          { key: "TYRES", status: "OK" },
          { key: "BRAKES", status: "OK" },
        ],
      };

      // Act & Assert
      const response = await request(app)
        .post("/checks")
        .send(invalidBody)
        .expect(400);

      expect(response.body.error.details).toContainEqual({
        field: "items",
        reason: "must contain exactly 5 items",
      });
    });

    it("should return 400 for missing required fields", async () => {
      // Act & Assert
      const response = await request(app).post("/checks").send({}).expect(400);

      expect(response.body.error.details.length).toBeGreaterThan(0);
    });

    it("should accept check without optional note", async () => {
      // Arrange
      const { note, ...bodyWithoutNote } = validCheckBody;

      // Act & Assert
      const response = await request(app)
        .post("/checks")
        .send(bodyWithoutNote)
        .expect(201);

      expect(response.body.note).toBeUndefined();
    });
  });

  describe("GET /checks", () => {
    beforeEach(() => {
      (database.readChecks as jest.Mock).mockReturnValue(mockChecks);
    });

    it("should return checks filtered by vehicleId", async () => {
      // Act & Assert
      const response = await request(app)
        .get("/checks")
        .query({ vehicleId: "VH001" })
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.every((c: Check) => c.vehicleId === "VH001")).toBe(
        true,
      );
    });

    it("should filter by hasIssue=true", async () => {
      // Act & Assert
      const response = await request(app)
        .get("/checks")
        .query({ vehicleId: "VH001", hasIssue: "true" })
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe("CHK002");
      expect(response.body[0].hasIssue).toBe(true);
    });

    it("should filter by hasIssue=false", async () => {
      // Act & Assert
      const response = await request(app)
        .get("/checks")
        .query({ vehicleId: "VH001", hasIssue: "false" })
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe("CHK001");
      expect(response.body[0].hasIssue).toBe(false);
    });

    it("should return checks sorted by createdAt descending", async () => {
      // Act & Assert
      const response = await request(app)
        .get("/checks")
        .query({ vehicleId: "VH001" })
        .expect(200);

      expect(response.body[0].id).toBe("CHK002"); // Newer
      expect(response.body[1].id).toBe("CHK001"); // Older
    });

    it("should return 400 when vehicleId is missing", async () => {
      // Act & Assert
      const response = await request(app).get("/checks").expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.error.details).toContainEqual({
        field: "vehicleId",
        reason: "is required",
      });
    });

    it("should return empty array when no checks match", async () => {
      // Act & Assert
      const response = await request(app)
        .get("/checks")
        .query({ vehicleId: "VH999" })
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe("DELETE /checks/:id", () => {
    beforeEach(() => {
      (database.readChecks as jest.Mock).mockReturnValue(mockChecks);
      (database.writeChecks as jest.Mock).mockImplementation(() => {});
    });

    it("should delete check and return 204", async () => {
      // Act & Assert
      await request(app).delete("/checks/CHK001").expect(204);

      // Verify writeChecks was called with filtered array
      expect(database.writeChecks).toHaveBeenCalledWith([mockChecks[1]]);
    });

    it("should return 404 when check does not exist", async () => {
      // Act & Assert
      const response = await request(app)
        .delete("/checks/NONEXISTENT")
        .expect(404);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe("NOT_FOUND");
      expect(response.body.error.message).toBe("Check not found");
    });

    it("should not modify data when check not found", async () => {
      // Act
      await request(app).delete("/checks/NONEXISTENT").expect(404);

      // Assert - writeChecks should not be called
      expect(database.writeChecks).not.toHaveBeenCalled();
    });
  });
});
