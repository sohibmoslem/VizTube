import { body } from "express-validator";

/**
 * @description Validation rules for the user registration endpoint.
 * @returns {Array} An array of express-validator middleware chains.
 */
export const userRegValidator = () => {
	return [
		// --- Username Validation ---
		body("username")
			.trim()
			.notEmpty()
			.withMessage("Username is required")
			.isLength({ min: 3, max: 30 })
			.withMessage("Username must be between 3 and 30 characters")
			.matches(/^[a-zA-Z0-9_]+$/)
			.withMessage(
				"Username can only contain letters, numbers, and underscores"
			)
			.custom((value) => {
				// Example of a custom validator to block reserved names.
				const reservedUsernames = ["admin", "user", "moderator", "system"];
				if (reservedUsernames.includes(value.toLowerCase())) {
					throw new Error("This username is reserved");
				}
				return true;
			}),

		// --- Full Name Validation ---
		body("fullName")
			.trim()
			.notEmpty()
			.withMessage("Full name is required")
			.isLength({ min: 2, max: 50 })
			.withMessage("Full name must be between 2 and 50 characters")
			.matches(/^[a-zA-Z\s]+$/)
			.withMessage("Full name can only contain letters and spaces"),

		// --- Email Validation ---
		body("email")
			.notEmpty()
			.withMessage("Email is required")
			.isEmail()
			.withMessage("Please enter a valid email address"),

		// --- Password Validation ---
		body("password")
			.trim()
			.notEmpty()
			.withMessage("Password is required")
			.isLength({ min: 6 })
			.withMessage("Password must be at least 6 characters long")
			.matches(/[A-Z]/)
			.withMessage("Password must contain at least one uppercase letter")
			.matches(/[a-z]/)
			.withMessage("Password must contain at least one lowercase letter")
			.matches(/[0-9]/)
			.withMessage("Password must contain at least one number")
			.matches(/[!@#$%^&*(),.?":{}|<>]/)
			.withMessage("Password must contain at least one special character"),
	];
};

/**
 * @description Validation rules for the user login endpoint.
 * @returns {Array} An array of express-validator middleware chains.
 */
export const loginValidator = () => {
	return [
		// --- Email Validation ---
		body("email")
			.notEmpty()
			.withMessage("Email is required")
			.isEmail()
			.withMessage("Please enter a valid email address"),

		// --- Password Validation ---
		body("password").notEmpty().withMessage("Password is required"),
	];
};

/**
 * @description Validation rules for the change password endpoint.
 * @returns {Array} An array of express-validator middleware chains.
 */
export const currentPasswordValidator = () => {
	return [
		// --- Old Password Validation ---
		body("oldPassword").notEmpty().withMessage("Old password is required"),

		// --- New Password Validation (with strong password requirements) ---
		body("newPassword")
			.trim()
			.notEmpty()
			.withMessage("New password is required")
			.isLength({ min: 6 })
			.withMessage("New password must be at least 6 characters long")
			.matches(/[A-Z]/)
			.withMessage("New password must contain at least one uppercase letter")
			.matches(/[a-z]/)
			.withMessage("New password must contain at least one lowercase letter")
			.matches(/[0-9]/)
			.withMessage("New password must contain at least one number")
			.matches(/[!@#$%^&*(),.?":{}|<>]/)
			.withMessage("New password must contain at least one special character"),
	];
};
