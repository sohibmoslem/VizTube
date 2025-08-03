import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

/**
 * Middleware to verify the JWT access token and attach the authenticated user to the request object.
 * This protects routes by ensuring that only logged-in users can access them.
 *
 * It extracts the token from either the request cookies or the Authorization header.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The Express next middleware function.
 */
export const authMid = asyncHandler(async (req, res, next) => {
	try {
		// 1. Extract the token from the request.
		// It checks for an 'accessToken' in the cookies first,
		// then falls back to the 'Authorization' header (e.g., "Bearer <token>").
		const token =
			req.cookies?.accessToken ||
			req.header("Authorization")?.replace("Bearer ", "");

		if (!token) {
			throw new ApiError(401, "Unauthorized request: No token provided");
		}

		// 2. Verify the token's signature and decode its payload.
		// This will throw an error if the token is invalid or expired.
		const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

		// 3. Find the user in the database based on the ID from the decoded token.
		// We exclude the password and refreshToken for security.
		const user = await User.findById(decodedToken?._id).select(
			"-password -refreshToken"
		);

		if (!user) {
			// This is a crucial security check. If the user associated with a valid token
			// has been deleted, we must deny access.
			throw new ApiError(401, "Invalid Access Token: User not found");
		}

		// 4. Attach the authenticated user object to the request.
		// This allows subsequent controllers and middleware to access the logged-in user's details.
		req.user = user;
		next(); // Pass control to the next middleware/controller in the chain.
	} catch (error) {
		// Catches errors from jwt.verify (e.g., expired token, invalid signature).
		throw new ApiError(401, "Invalid or expired access token");
	}
});
