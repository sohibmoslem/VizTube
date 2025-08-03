import { User } from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
	uploadOnCloudinary,
	deleteFromCloudinary,
} from "../utils/cloudinary.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

/**
 * @description Generates a new pair of access and refresh tokens for a given user.
 * @param {mongoose.Types.ObjectId} userId - The ID of the user for whom to generate tokens.
 * @returns {Promise<{accessToken: string, refreshToken: string}>} An object containing the new tokens.
 */
const generateAccessAndRefreshToken = async (userId) => {
	try {
		const user = await User.findById(userId);
		if (!user) {
			throw new ApiError(404, "User not found");
		}

		const accessToken = user.generateAccessToken();
		const refreshToken = user.generateRefreshToken();

		user.refreshToken = refreshToken;
		await user.save({ validateBeforeSave: false });

		return { accessToken, refreshToken };
	} catch (error) {
		throw new ApiError(500, "Something went wrong while generating tokens");
	}
};

/**
 * @controller register
 * @description Handles new user registration, including file uploads for avatar and cover image.
 */
export const register = asyncHandler(async (req, res) => {
	// 1. Get user details from request body
	const { fullName, email, username, password } = req.body;
	if (
		[fullName, email, username, password].some((field) => field?.trim() === "")
	) {
		throw new ApiError(400, "All fields are required");
	}

	// 2. Check if user already exists
	const existedUser = await User.findOne({ $or: [{ username }, { email }] });
	if (existedUser) {
		throw new ApiError(409, "User with this email or username already exists");
	}

	// 3. Handle file uploads to Cloudinary
	const avatarLocalPath = req.files?.avatar?.[0]?.path;
	if (!avatarLocalPath) {
		throw new ApiError(400, "Avatar file is required");
	}
	const avatar = await uploadOnCloudinary(avatarLocalPath);
	if (!avatar) {
		throw new ApiError(500, "Failed to upload avatar");
	}

	const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
	const coverImage = coverImageLocalPath
		? await uploadOnCloudinary(coverImageLocalPath)
		: null;

	// 4. Create user in the database
	const user = await User.create({
		fullName,
		email,
		username: username.toLowerCase(),
		password,
		avatar: { url: avatar.url, public_id: avatar.public_id },
		coverImage: {
			url: coverImage?.url || "",
			public_id: coverImage?.public_id || "",
		},
	});

	// 5. Return response, removing sensitive fields
	const createdUser = await User.findById(user._id).select(
		"-password -refreshToken"
	);
	if (!createdUser) {
		throw new ApiError(500, "Something went wrong while registering the user");
	}

	return res
		.status(201)
		.json(new ApiResponse(201, "User registered successfully", createdUser));
});

/**
 * @controller login
 * @description Handles user login and issues access and refresh tokens.
 */
export const login = asyncHandler(async (req, res) => {
	const { email, username, password } = req.body;
	if (!password || (!username && !email)) {
		throw new ApiError(400, "Username or email, and password are required");
	}

	// Find user by username or email (case-insensitive)
	const query = username
		? { username: username.toLowerCase() }
		: { email: email.toLowerCase() };
	const user = await User.findOne(query);
	if (!user) {
		throw new ApiError(404, "User does not exist");
	}

	// Verify password
	const isPasswordCorrect = await user.isPasswordMatched(password);
	if (!isPasswordCorrect) {
		throw new ApiError(401, "Invalid user credentials");
	}

	// Generate tokens and send them in cookies and response body
	const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
		user._id
	);
	const loggedInUser = await User.findById(user._id).select(
		"-password -refreshToken"
	);

	const options = {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
	};

	return res
		.status(200)
		.cookie("accessToken", accessToken, options)
		.cookie("refreshToken", refreshToken, options)
		.json(
			new ApiResponse(200, "User logged in successfully", {
				user: loggedInUser,
				accessToken,
				refreshToken,
			})
		);
});

/**
 * @controller logout
 * @description Logs out the user by clearing their refresh token from the database and cookies.
 */
export const logout = asyncHandler(async (req, res) => {
	// Clear the refresh token from the user's document in the DB.
	await User.findByIdAndUpdate(
		req.user._id,
		{ $unset: { refreshToken: 1 } }, // Use $unset to remove the field
		{ new: true }
	);

	const options = {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
	};

	return res
		.status(200)
		.clearCookie("accessToken", options)
		.clearCookie("refreshToken", options)
		.json(new ApiResponse(200, "User logged out successfully", {}));
});

/**
 * @controller refToken
 * @description Refreshes the access token using a valid refresh token.
 */
export const refToken = asyncHandler(async (req, res) => {
	const incomingRefreshToken = req.cookies?.refreshToken;
	if (!incomingRefreshToken) {
		throw new ApiError(401, "Unauthorized request: Refresh token is missing");
	}

	try {
		const decodedToken = jwt.verify(
			incomingRefreshToken,
			process.env.REFRESH_TOKEN_SECRET
		);
		const user = await User.findById(decodedToken?._id);

		if (!user || incomingRefreshToken !== user.refreshToken) {
			throw new ApiError(401, "Invalid or expired refresh token");
		}

		const { accessToken, refreshToken: newRefreshToken } =
			await generateAccessAndRefreshToken(user._id);

		const options = {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
		};

		return res
			.status(200)
			.cookie("accessToken", accessToken, options)
			.cookie("refreshToken", newRefreshToken, options)
			.json(
				new ApiResponse(200, "Access token refreshed successfully", {
					accessToken,
					refreshToken: newRefreshToken,
				})
			);
	} catch (error) {
		throw new ApiError(401, "Invalid or expired refresh token");
	}
});

/**
 * @controller changeCurrentPassword
 * @description Allows a logged-in user to change their password.
 */
export const changeCurrentPassword = asyncHandler(async (req, res) => {
	const { oldPassword, newPassword } = req.body;
	const user = await User.findById(req.user?._id);

	const isPasswordCorrect = await user.isPasswordMatched(oldPassword);
	if (!isPasswordCorrect) {
		throw new ApiError(401, "Incorrect old password");
	}

	user.password = newPassword;
	await user.save({ validateBeforeSave: true }); // Use validation

	return res
		.status(200)
		.json(new ApiResponse(200, "Password changed successfully", {}));
});

/**
 * @controller getCurrentUser
 * @description Fetches the details of the currently logged-in user.
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
	// The user object is already attached to req by the auth middleware.
	return res
		.status(200)
		.json(new ApiResponse(200, "Current user fetched successfully", req.user));
});

/**
 * @controller updateAccountDetails
 * @description Updates the full name and email of the logged-in user.
 */
export const updateAccountDetails = asyncHandler(async (req, res) => {
	const { fullName, email } = req.body;
	if (!fullName && !email) {
		throw new ApiError(
			400,
			"At least one field (fullName, email) is required to update"
		);
	}

	const updatedUser = await User.findByIdAndUpdate(
		req.user?._id,
		{ $set: { fullName, email } },
		{ new: true }
	).select("-password -refreshToken");

	return res
		.status(200)
		.json(
			new ApiResponse(200, "Account details updated successfully", updatedUser)
		);
});

/**
 * @controller updateUserAvatar
 * @description Updates the avatar of the logged-in user.
 */
export const updateUserAvatar = asyncHandler(async (req, res) => {
	const avatarLocalPath = req.file?.path;
	if (!avatarLocalPath) {
		throw new ApiError(400, "Avatar file is required");
	}

	const avatar = await uploadOnCloudinary(avatarLocalPath);
	if (!avatar?.url) {
		throw new ApiError(500, "Failed to upload avatar");
	}

	// TODO: Delete the old avatar from Cloudinary using `req.user.avatar.public_id`

	const updatedUser = await User.findByIdAndUpdate(
		req.user?._id,
		{ $set: { avatar: { url: avatar.url, public_id: avatar.public_id } } },
		{ new: true }
	).select("-password -refreshToken");

	return res
		.status(200)
		.json(new ApiResponse(200, "Avatar updated successfully", updatedUser));
});

/**
 * @controller updateUserCoverImage
 * @description Updates the cover image of the logged-in user.
 */
export const updateUserCoverImage = asyncHandler(async (req, res) => {
	const coverImageLocalPath = req.file?.path;
	if (!coverImageLocalPath) {
		throw new ApiError(400, "Cover image file is required");
	}

	const coverImage = await uploadOnCloudinary(coverImageLocalPath);
	if (!coverImage?.url) {
		throw new ApiError(500, "Failed to upload cover image");
	}

	// TODO: Delete the old cover image from Cloudinary

	const updatedUser = await User.findByIdAndUpdate(
		req.user?._id,
		{
			$set: {
				coverImage: { url: coverImage.url, public_id: coverImage.public_id },
			},
		},
		{ new: true }
	).select("-password -refreshToken");

	return res
		.status(200)
		.json(
			new ApiResponse(200, "Cover image updated successfully", updatedUser)
		);
});

/**
 * @controller getUserChannelProfile
 * @description Fetches the public profile of a user (channel), including subscriber stats.
 */
export const getUserChannelProfile = asyncHandler(async (req, res) => {
	const { username } = req.params;
	if (!username?.trim()) {
		throw new ApiError(400, "Username is required");
	}

	const channel = await User.aggregate([
		{ $match: { username: username.toLowerCase() } },
		{
			$lookup: {
				from: "subscriptions",
				localField: "_id",
				foreignField: "channel",
				as: "subscribers",
			},
		},
		{
			$lookup: {
				from: "subscriptions",
				localField: "_id",
				foreignField: "subscriber",
				as: "subscribedTo",
			},
		},
		{
			$addFields: {
				subscriberCount: { $size: "$subscribers" },
				channelsSubscribedToCount: { $size: "$subscribedTo" },
				isSubscribed: {
					$cond: {
						if: { $in: [req.user?._id, "$subscribers.subscriber"] },
						then: true,
						else: false,
					},
				},
			},
		},
		{
			$project: {
				fullName: 1,
				username: 1,
				subscriberCount: 1,
				channelsSubscribedToCount: 1,
				isSubscribed: 1,
				avatar: "$avatar.url",
				coverImage: "$coverImage.url",
			},
		},
	]);

	if (!channel?.length) {
		throw new ApiError(404, "Channel does not exist");
	}

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				"User channel profile fetched successfully",
				channel[0]
			)
		);
});

/**
 * @controller getWatchHistory
 * @description Fetches the watch history of the logged-in user.
 */
export const getWatchHistory = asyncHandler(async (req, res) => {
	const user = await User.aggregate([
		{ $match: { _id: new mongoose.Types.ObjectId(req.user._id) } },
		{
			$lookup: {
				from: "videos",
				localField: "watchHistory",
				foreignField: "_id",
				as: "watchHistory",
				pipeline: [
					{
						$lookup: {
							from: "users",
							localField: "owner",
							foreignField: "_id",
							as: "owner",
							pipeline: [
								{
									$project: { fullName: 1, username: 1, avatar: "$avatar.url" },
								},
							],
						},
					},
					{ $addFields: { owner: { $first: "$owner" } } },
				],
			},
		},
	]);

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				"Watch history fetched successfully",
				user[0]?.watchHistory || []
			)
		);
});
