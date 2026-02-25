import type {
  Vehicle,
  Check,
  CreateCheckRequest,
  ErrorResponse,
} from "./types";

const API_BASE = "http://localhost:3000";

export const api = {
  async getVehicles(): Promise<Vehicle[]> {
    const response = await fetch(`${API_BASE}/vehicles`);
    if (!response.ok) throw new Error("Failed to fetch vehicles");
    return response.json();
  },

  async createCheck(data: CreateCheckRequest): Promise<Check> {
    const response = await fetch(`${API_BASE}/checks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw error;
    }

    return response.json();
  },

  async getChecks(vehicleId: string, hasIssue?: boolean): Promise<Check[]> {
    const params = new URLSearchParams({ vehicleId });
    if (hasIssue !== undefined) {
      params.append("hasIssue", String(hasIssue));
    }

    const response = await fetch(`${API_BASE}/checks?${params}`);
    if (!response.ok) throw new Error("Failed to fetch checks");
    return response.json();
  },
};
