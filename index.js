/**
 * @file Main entry point for the VisionTube application.
 * @description This file initializes the application by loading environment variables,
 * connecting to the MongoDB database, and starting the Express server.
 */

import dotenv from "dotenv";
import connectDB from "./src/utils/index.js";
import app from "./app.js";

// Configure environment variables from the .env file.
// This is the first step to ensure all subsequent modules have access to them.
dotenv.config({
	path: "./.env",
});

/**
 * Main application startup sequence.
 * Attempts to connect to the database first. If the connection is successful,
 * it starts the Express server. If the connection fails, it logs the error
 * and exits the process.
 */
connectDB()
	.then(() => {
		// Set up an error listener on the Express app.
		// This catches any server errors that might occur *after* the initial startup.
		app.on("error", (error) => {
			console.error("SERVER ERROR :: ", error);
		});

		// Start the Express server and listen for incoming requests on the configured port.
		app.listen(process.env.PORT || 8000, () => {
			console.log(`Server is running on port: ${process.env.PORT || 8000}`);
		});
	})
	.catch((err) => {
		// Log a fatal error message if the database connection fails.
		console.log("MONGO DB connection failed !!! ", err);
	});
