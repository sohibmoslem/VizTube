import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * @schema UserSchema
 * @description Mongoose schema for the User model.
 * Defines the structure and behavior of user documents in the database.
 */
const userSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			index: true, // Improves search performance for usernames.
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		fullName: {
			type: String,
			required: true,
			trim: true,
		},
		avatar: {
			url: { type: String, required: true }, // URL of the image on Cloudinary.
			public_id: { type: String, required: true }, // The public_id from Cloudinary, used for deletion.
		},
		coverImage: {
			url: { type: String },
			public_id: { type: String },
		},
		watchHistory: [
			{
				type: Schema.Types.ObjectId,
				ref: "Video",
			},
		],
		password: {
			type: String,
			required: [true, "Password is required"],
		},
		refreshToken: {
			type: String,
		},
	},
	{ timestamps: true } // Automatically adds createdAt and updatedAt fields.
);

/**
 * Mongoose 'pre-save' hook.
 * This middleware runs automatically before a user document is saved.
 * It hashes the user's password if it has been modified.
 */
userSchema.pre("save", async function (next) {
	// Only hash the password if it's new or has been changed.
	if (!this.isModified("password")) return next();

	this.password = await bcrypt.hash(this.password, 10);
	next();
});

/**
 * Custom method to compare a candidate password with the user's stored hashed password.
 * @param {string} password - The plain-text password to compare.
 * @returns {Promise<boolean>} A promise that resolves to true if the passwords match, false otherwise.
 */
userSchema.methods.isPasswordMatched = async function (password) {
	return await bcrypt.compare(password, this.password);
};

/**
 * Custom method to generate a short-lived JSON Web Token (JWT) for authentication.
 * @returns {string} The generated access token.
 */
userSchema.methods.generateAccessToken = function () {
	return jwt.sign(
		{
			_id: this._id,
			email: this.email,
			username: this.username,
			fullName: this.fullName,
		},
		process.env.ACCESS_TOKEN_SECRET,
		{
			expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
		}
	);
};

/**
 * Custom method to generate a long-lived JSON Web Token (JWT) for refreshing sessions.
 * @returns {string} The generated refresh token.
 */
userSchema.methods.generateRefreshToken = function () {
	return jwt.sign(
		{
			_id: this._id,
		},
		process.env.REFRESH_TOKEN_SECRET,
		{
			expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
		}
	);
};

export const User = mongoose.model("User", userSchema);
