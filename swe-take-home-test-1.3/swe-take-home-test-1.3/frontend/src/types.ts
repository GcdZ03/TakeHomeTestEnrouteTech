export interface Vehicle {
  id: string;
  registration: string;
  make: string;
  model: string;
  year: number;
}

export type CheckItemKey = "TYRES" | "BRAKES" | "LIGHTS" | "OIL" | "COOLANT";
export type CheckItemStatus = "OK" | "FAIL";

export interface CheckItem {
  key: CheckItemKey;
  status: CheckItemStatus;
}

export interface Check {
  id: string;
  vehicleId: string;
  odometerKm: number;
  items: CheckItem[];
  note?: string;
  hasIssue: boolean;
  createdAt: string;
}

export interface CreateCheckRequest {
  vehicleId: string;
  odometerKm: number;
  items: CheckItem[];
  note?: string;
}

export interface ValidationError {
  field: string;
  reason: string;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details: ValidationError[];
  };
}
