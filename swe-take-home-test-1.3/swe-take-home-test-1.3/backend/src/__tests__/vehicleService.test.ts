/**
 * Vehicle Service Tests
 *
 * Unit tests for the vehicle service layer.
 * These tests verify that vehicle-related business logic functions correctly.
 */

import * as vehicleService from "../services/vehicleService";
import * as database from "../database";
import { Vehicle } from "../types";

// Mock the database module
jest.mock("../database");

describe("Vehicle Service", () => {
  // Sample test data
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

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("getAllVehicles", () => {
    it("should return all vehicles from the database", () => {
      // Arrange: Setup mock to return test data
      (database.readVehicles as jest.Mock).mockReturnValue(mockVehicles);

      // Act: Call the service function
      const result = vehicleService.getAllVehicles();

      // Assert: Verify results
      expect(result).toEqual(mockVehicles);
      expect(database.readVehicles).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no vehicles exist", () => {
      // Arrange
      (database.readVehicles as jest.Mock).mockReturnValue([]);

      // Act
      const result = vehicleService.getAllVehicles();

      // Assert
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe("checkVehicleExists", () => {
    it("should return true when vehicle exists", () => {
      // Arrange
      (database.vehicleExists as jest.Mock).mockReturnValue(true);

      // Act
      const result = vehicleService.checkVehicleExists("VH001");

      // Assert
      expect(result).toBe(true);
      expect(database.vehicleExists).toHaveBeenCalledWith("VH001");
    });

    it("should return false when vehicle does not exist", () => {
      // Arrange
      (database.vehicleExists as jest.Mock).mockReturnValue(false);

      // Act
      const result = vehicleService.checkVehicleExists("INVALID");

      // Assert
      expect(result).toBe(false);
      expect(database.vehicleExists).toHaveBeenCalledWith("INVALID");
    });
  });

  describe("getVehicleById", () => {
    it("should return vehicle when ID matches", () => {
      // Arrange
      (database.readVehicles as jest.Mock).mockReturnValue(mockVehicles);

      // Act
      const result = vehicleService.getVehicleById("VH001");

      // Assert
      expect(result).toEqual(mockVehicles[0]);
      expect(result?.id).toBe("VH001");
    });

    it("should return undefined when vehicle not found", () => {
      // Arrange
      (database.readVehicles as jest.Mock).mockReturnValue(mockVehicles);

      // Act
      const result = vehicleService.getVehicleById("NONEXISTENT");

      // Assert
      expect(result).toBeUndefined();
    });

    it("should return undefined when vehicle list is empty", () => {
      // Arrange
      (database.readVehicles as jest.Mock).mockReturnValue([]);

      // Act
      const result = vehicleService.getVehicleById("VH001");

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
