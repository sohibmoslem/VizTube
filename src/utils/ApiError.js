/**
 * @class ApiError
 * @extends Error
 * @description A custom error class for handling API-specific errors in a consistent format.
 * This class extends the built-in Error class to include an HTTP status code and other relevant details.
 */
class ApiError extends Error {
	/**
	 * Creates an instance of ApiError.
	 * @param {number} statusCode - The HTTP status code for the error (e.g., 404, 400).
	 * @param {string} [message="Something went wrong"] - The error message.
	 * @param {Array} [errors=[]] - An array of detailed validation errors, if any.
	 * @param {string} [stack=""] - The error stack trace.
	 */
	constructor(
		statusCode,
		message = "Something went wrong",
		errors = [], // Corrected typo from 'error' to 'errors' for clarity
		stack = ""
	) {
		// Call the parent constructor with the error message.
		super(message);

		// --- Custom Properties ---
		this.statusCode = statusCode;
		this.data = null; // Set to null as this class represents a failed response.
		this.message = message;
		this.success = false; // Indicates that the API call was not successful.
		this.errors = errors;

		// Capture the stack trace, excluding the constructor call from it.
		if (stack) {
			this.stack = stack;
		} else {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}

export default ApiError;
