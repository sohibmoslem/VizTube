/**
 * A higher-order function that wraps an asynchronous Express route handler
 * to catch any errors and pass them to the next middleware.
 * This avoids the need for repetitive try-catch blocks in every controller.
 *
 * @param {Function} requestHandler - The asynchronous controller function to execute.
 * @returns {Function} An Express middleware function that handles the async logic.
 */
export const asyncHandler = (requestHandler) => {
	// Return a new function that Express will call with (req, res, next)
	return (req, res, next) => {
		// Ensure the requestHandler is treated as a Promise and catch any potential rejections.
		Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
	};
};
