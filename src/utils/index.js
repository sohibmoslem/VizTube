import mongoose from "mongoose";
import { URL } from "url"; // Built-in Node.js module for URL parsing.

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * It includes a robust mechanism to clean the connection URI, preventing common errors.
 * If the connection fails, it terminates the application process.
 *
 * @returns {Promise<void>} A promise that resolves when the connection is successful.
 */
const connectDB = async () => {
	try {
		const originalUri = process.env.MONGODB_URI;

		if (!originalUri) {
			throw new Error("MONGODB_URI is not defined in the .env file.");
		}

		// --- Robust Connection URI Cleaning ---
		// This block programmatically cleans the MongoDB URI to prevent the
		// 'MongoWriteConcernError' caused by malformed 'w' parameters.
		const parsedUrl = new URL(originalUri);
		parsedUrl.searchParams.set("w", "majority"); // Enforce the correct write concern.
		const cleanedUri = parsedUrl.toString(); // Rebuild the cleaned URI.

		// Establish the database connection using the cleaned URI.
		const connectionInstance = await mongoose.connect(cleanedUri);

		// Log a success message, including the host for verification.
		console.log(
			`\nMongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
		);
	} catch (error) {
		// Log a fatal error and exit the application if the connection fails.
		console.error("MONGO DB CONNECTION FAILED :: ", error);
		process.exit(1);
	}
};

export default connectDB;
