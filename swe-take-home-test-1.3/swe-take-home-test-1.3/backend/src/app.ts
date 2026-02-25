/**
 * Express Application Configuration
 *
 * This module sets up and configures the Express application with all
 * necessary middleware, routes, and error handlers. By separating the
 * app configuration from the server startup, we make the application
 * more testable and maintainable.
 */

import express, { Application } from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

/**
 * Creates and configures the Express application
 *
 * This function:
 * - Initializes the Express app
 * - Configures CORS for cross-origin requests
 * - Sets up JSON body parsing
 * - Registers all API routes
 * - Adds error handling middleware
 *
 * @returns Configured Express application instance
 *
 * @example
 * const app = createApp();
 * app.listen(3000, () => console.log('Server running'));
 */
export const createApp = (): Application => {
  const app = express();

  // Middleware setup
  app.use(cors()); // Enable CORS for all routes
  app.use(express.json()); // Parse JSON request bodies

  // API routes
  app.use("/", routes);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
};
