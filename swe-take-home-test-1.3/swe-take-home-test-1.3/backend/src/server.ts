/**
 * Server Entry Point
 *
 * This is the main entry point for the backend server.
 * It imports the configured Express application and starts the HTTP server
 * on the specified port. The separation of app configuration (app.ts) from
 * server startup (server.ts) makes the application easier to test.
 */

import { createApp } from "./app";

const PORT = process.env.PORT || 3000;

/**
 * Initialize and start the server
 *
 * Creates the Express application instance and starts listening for
 * incoming HTTP connections on the configured port.
 */
const app = createApp();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints available at:`);
  console.log(`   - GET  http://localhost:${PORT}/vehicles`);
  console.log(`   - POST http://localhost:${PORT}/checks`);
  console.log(`   - GET  http://localhost:${PORT}/checks?vehicleId={id}`);
});
