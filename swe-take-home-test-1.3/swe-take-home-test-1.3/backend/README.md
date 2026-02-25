# Vehicle Inspection Backend API

A RESTful API backend for managing vehicles and their inspection checks, built with TypeScript, Express.js.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Run tests
npm test

# Build for production
npm run build
npm start
```

Server runs on **http://localhost:3000**

## Architecture

```
┌─────────────────────────────────────────┐
│         Routes Layer (HTTP)             │
├─────────────────────────────────────────┤
│      Controllers (Request Handling)     │
├─────────────────────────────────────────┤
│     Services (Business Logic)           │
├─────────────────────────────────────────┤
│   Database Layer (Data Access)          │
├─────────────────────────────────────────┤
│         JSON Files (Data Store)         │
└─────────────────────────────────────────┘
```

## Project Structure

```
backend/
├── src/
│   ├── __tests__/              # Test suites (56 tests)
│   ├── controllers/            # HTTP request handlers
│   ├── services/               # Business logic layer
│   ├── routes/                 # Route definitions
│   ├── middleware/             # Express middleware
│   ├── data/                   # JSON data files
│   ├── app.ts                  # Express app config
│   ├── server.ts               # Server entry point
│   ├── database.ts             # Data access layer
│   ├── types.ts                # TypeScript types
│   └── validation.ts           # Request validation
├── jest.config.js              # Jest configuration
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies
```

## Testing

### Run All Tests

```bash
npm test
```

### Watch Mode

```bash
npm run test:watch
```

## API Endpoints

### Get All Vehicles

```http
GET /vehicles
```

**Response:** `200 OK`

```json
[
  {
    "id": "VH001",
    "registration": "ABC123",
    "make": "Toyota",
    "model": "Hilux",
    "year": 2022
  }
]
```

### Create Inspection Check

```http
POST /checks
Content-Type: application/json
```

**Request Body:**

```json
{
  "vehicleId": "VH001",
  "odometerKm": 15000,
  "items": [
    { "key": "TYRES", "status": "OK" },
    { "key": "BRAKES", "status": "OK" },
    { "key": "LIGHTS", "status": "OK" },
    { "key": "OIL", "status": "OK" },
    { "key": "COOLANT", "status": "OK" }
  ],
  "note": "All systems operational"
}
```

**Response:** `201 Created`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "vehicleId": "VH001",
  "odometerKm": 15000,
  "items": [...],
  "note": "All systems operational",
  "hasIssue": false,
  "createdAt": "2026-01-27T10:30:00.000Z"
}
```

### Get Vehicle Checks

```http
GET /checks?vehicleId=VH001
GET /checks?vehicleId=VH001&hasIssue=true
```

**Response:** `200 OK`

```json
[
  {
    "id": "CHK001",
    "vehicleId": "VH001",
    "odometerKm": 15420,
    "items": [...],
    "hasIssue": false,
    "createdAt": "2026-01-20T08:30:00.000Z"
  }
]
```

Results are sorted by creation date (newest first).

### Delete Inspection Check

```http
DELETE /checks/:id
```

**Response:** `204 No Content` (success) or `404 Not Found` (check doesn't exist)

## Validation Rules

### Create Check Request

- `vehicleId`: Required, must exist in system
- `odometerKm`: Required, must be positive number
- `items`: Required array of exactly 5 items
  - Each item needs `key` and `status`
  - Keys: `TYRES`, `BRAKES`, `LIGHTS`, `OIL`, `COOLANT`
  - Status: `OK` or `FAIL`
  - All 5 keys must be present exactly once
- `note`: Optional, max 300 characters

### Get Checks Request

- `vehicleId`: Required query parameter
- `hasIssue`: Optional boolean (`true` or `false`)

## Error Handling

All errors return consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": [{ "field": "odometerKm", "reason": "must be > 0" }]
  }
}
```

## Status Codes

- `200 OK` - Successful GET request
- `201 Created` - Successful POST request
- `400 Bad Request` - Validation error
- `500 Internal Server Error` - Server error
