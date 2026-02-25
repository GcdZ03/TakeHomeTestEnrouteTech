/**
 * Check Service Tests
 *
 * Unit tests for the check service layer.
 * These tests verify that inspection check business logic functions correctly.
 */

import * as checkService from "../services/checkService";
import * as database from "../database";
import { Check, CheckItem } from "../types";

// Mock uuid to return predictable IDs
jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-uuid-1234"),
}));

// Mock the database module
jest.mock("../database");

describe("Check Service", () => {
  const mockCheckItems: CheckItem[] = [
    { key: "TYRES", status: "OK" },
    { key: "BRAKES", status: "OK" },
    { key: "LIGHTS", status: "OK" },
    { key: "OIL", status: "OK" },
    { key: "COOLANT", status: "OK" },
  ];

  const mockChecks: Check[] = [
    {
      id: "CHK001",
      vehicleId: "VH001",
      odometerKm: 15420,
      items: mockCheckItems,
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
    // Mock current date for consistent timestamps
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-01-27T10:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("createCheck", () => {
    it("should create a check without issues", () => {
      // Arrange
      (database.readChecks as jest.Mock).mockReturnValue([]);
      (database.writeChecks as jest.Mock).mockImplementation(() => {});

      const checkData: checkService.CreateCheckData = {
        vehicleId: "VH001",
        odometerKm: 15000,
        items: mockCheckItems,
        note: "All good",
      };

      // Act
      const result = checkService.createCheck(checkData);

      // Assert
      expect(result).toMatchObject({
        id: "test-uuid-1234",
        vehicleId: "VH001",
        odometerKm: 15000,
        items: mockCheckItems,
        note: "All good",
        hasIssue: false,
        createdAt: "2026-01-27T10:00:00.000Z",
      });
      expect(database.readChecks).toHaveBeenCalledTimes(1);
      expect(database.writeChecks).toHaveBeenCalledTimes(1);
    });

    it("should create a check with issues when any item fails", () => {
      // Arrange
      (database.readChecks as jest.Mock).mockReturnValue([]);
      (database.writeChecks as jest.Mock).mockImplementation(() => {});

      const failingItems: CheckItem[] = [
        { key: "TYRES", status: "OK" },
        { key: "BRAKES", status: "FAIL" },
        { key: "LIGHTS", status: "OK" },
        { key: "OIL", status: "OK" },
        { key: "COOLANT", status: "OK" },
      ];

      const checkData: checkService.CreateCheckData = {
        vehicleId: "VH001",
        odometerKm: 15000,
        items: failingItems,
      };

      // Act
      const result = checkService.createCheck(checkData);

      // Assert
      expect(result.hasIssue).toBe(true);
      expect(result.note).toBeUndefined();
    });

    it("should persist the check to the database", () => {
      // Arrange
      const existingChecks = [mockChecks[0]];
      (database.readChecks as jest.Mock).mockReturnValue(existingChecks);
      (database.writeChecks as jest.Mock).mockImplementation(() => {});

      const checkData: checkService.CreateCheckData = {
        vehicleId: "VH002",
        odometerKm: 20000,
        items: mockCheckItems,
      };

      // Act
      checkService.createCheck(checkData);

      // Assert
      expect(database.writeChecks).toHaveBeenCalledWith([
        mockChecks[0],
        expect.objectContaining({
          vehicleId: "VH002",
          odometerKm: 20000,
        }),
      ]);
    });
  });

  describe("getChecks", () => {
    beforeEach(() => {
      (database.readChecks as jest.Mock).mockReturnValue(mockChecks);
    });

    it("should filter checks by vehicleId", () => {
      // Act
      const result = checkService.getChecks({ vehicleId: "VH001" });

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every((c) => c.vehicleId === "VH001")).toBe(true);
    });

    it("should filter checks by vehicleId and hasIssue=true", () => {
      // Act
      const result = checkService.getChecks({
        vehicleId: "VH001",
        hasIssue: true,
      });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("CHK002");
      expect(result[0]?.hasIssue).toBe(true);
    });

    it("should filter checks by vehicleId and hasIssue=false", () => {
      // Act
      const result = checkService.getChecks({
        vehicleId: "VH001",
        hasIssue: false,
      });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("CHK001");
      expect(result[0]?.hasIssue).toBe(false);
    });

    it("should return empty array when no checks match filter", () => {
      // Act
      const result = checkService.getChecks({ vehicleId: "VH999" });

      // Assert
      expect(result).toEqual([]);
    });

    it("should sort checks by createdAt descending (newest first)", () => {
      // Act
      const result = checkService.getChecks({ vehicleId: "VH001" });

      // Assert
      expect(result[0]?.id).toBe("CHK002"); // Newer check
      expect(result[1]?.id).toBe("CHK001"); // Older check
    });
  });

  describe("getCheckById", () => {
    beforeEach(() => {
      (database.readChecks as jest.Mock).mockReturnValue(mockChecks);
    });

    it("should return check when ID matches", () => {
      // Act
      const result = checkService.getCheckById("CHK001");

      // Assert
      expect(result).toEqual(mockChecks[0]);
    });

    it("should return undefined when check not found", () => {
      // Act
      const result = checkService.getCheckById("NONEXISTENT");

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe("deleteCheck", () => {
    beforeEach(() => {
      (database.readChecks as jest.Mock).mockReturnValue(mockChecks);
      (database.writeChecks as jest.Mock).mockImplementation(() => {});
    });

    it("should delete check and return true when found", () => {
      // Act
      const result = checkService.deleteCheck("CHK001");

      // Assert
      expect(result).toBe(true);
      expect(database.writeChecks).toHaveBeenCalledWith([mockChecks[1]]);
    });

    it("should return false when check not found", () => {
      // Act
      const result = checkService.deleteCheck("NONEXISTENT");

      // Assert
      expect(result).toBe(false);
      expect(database.writeChecks).not.toHaveBeenCalled();
    });

    it("should handle deleting from empty list", () => {
      // Arrange
      (database.readChecks as jest.Mock).mockReturnValue([]);

      // Act
      const result = checkService.deleteCheck("CHK001");

      // Assert
      expect(result).toBe(false);
      expect(database.writeChecks).not.toHaveBeenCalled();
    });
  });
});
