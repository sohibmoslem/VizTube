/**
 * @class ApiResponse
 * @description A standardized wrapper for successful API responses.
 * This class ensures that all successful responses sent from the API have a consistent structure.
 */
class ApiResponse {
	/**
	 * Creates an instance of ApiResponse.
	 * @param {number} statusCode - The HTTP status code for the response (e.g., 200, 201).
	 * @param {string} [message="Success"] - A descriptive message for the response.
	 * @param {Object | Array} data - The data payload to be sent in the response.
	 */
	constructor(statusCode, message = "Success", data) {
		this.statusCode = statusCode;
		this.data = data;
		this.message = message;
		// The 'success' flag is determined automatically based on the HTTP status code.
		// Codes less than 400 (e.g., 2xx, 3xx) indicate success.
		this.success = statusCode < 400;
	}
}

export default ApiResponse;
