import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @controller toggleVideoLike
 * @description Toggles a like on a video for the logged-in user.
 * If the user has already liked the video, the like is removed. Otherwise, a new like is added.
 */
const toggleVideoLike = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	if (!isValidObjectId(videoId)) {
		throw new ApiError(400, "Invalid Video ID");
	}

	// Check if a like document already exists for this user and video.
	const existingLike = await Like.findOne({
		video: videoId,
		likedBy: req.user?._id,
	});

	if (existingLike) {
		// If it exists, remove it.
		await Like.findByIdAndDelete(existingLike._id);
		return res
			.status(200)
			.json(
				new ApiResponse(200, "Like removed successfully", { isLiked: false })
			);
	} else {
		// If it doesn't exist, create it.
		await Like.create({
			video: videoId,
			likedBy: req.user?._id,
		});
		return res
			.status(200)
			.json(new ApiResponse(200, "Like added successfully", { isLiked: true }));
	}
});

/**
 * @controller toggleCommentLike
 * @description Toggles a like on a comment for the logged-in user.
 */
const toggleCommentLike = asyncHandler(async (req, res) => {
	const { commentId } = req.params;
	if (!isValidObjectId(commentId)) {
		throw new ApiError(400, "Invalid Comment ID");
	}

	const existingLike = await Like.findOne({
		comment: commentId,
		likedBy: req.user?._id,
	});

	if (existingLike) {
		await Like.findByIdAndDelete(existingLike._id);
		return res
			.status(200)
			.json(
				new ApiResponse(200, "Like removed successfully", { isLiked: false })
			);
	} else {
		await Like.create({
			comment: commentId,
			likedBy: req.user?._id,
		});
		return res
			.status(200)
			.json(new ApiResponse(200, "Like added successfully", { isLiked: true }));
	}
});

/**
 * @controller toggleTweetLike
 * @description Toggles a like on a tweet for the logged-in user.
 */
const toggleTweetLike = asyncHandler(async (req, res) => {
	const { tweetId } = req.params;
	if (!isValidObjectId(tweetId)) {
		throw new ApiError(400, "Invalid Tweet ID");
	}

	const existingLike = await Like.findOne({
		tweet: tweetId,
		likedBy: req.user?._id,
	});

	if (existingLike) {
		await Like.findByIdAndDelete(existingLike._id);
		return res
			.status(200)
			.json(
				new ApiResponse(200, "Like removed successfully", { isLiked: false })
			);
	} else {
		await Like.create({
			tweet: tweetId,
			likedBy: req.user?._id,
		});
		return res
			.status(200)
			.json(new ApiResponse(200, "Like added successfully", { isLiked: true }));
	}
});

/**
 * @controller getLikedVideos
 * @description Fetches all videos liked by the currently logged-in user.
 */
const getLikedVideos = asyncHandler(async (req, res) => {
	const likedVideos = await Like.aggregate([
		{
			// Find all 'like' documents created by the current user that have a 'video' field.
			$match: {
				likedBy: new mongoose.Types.ObjectId(req.user?._id),
				video: { $exists: true },
			},
		},
		{
			// Join with the 'videos' collection to get the details of each liked video.
			$lookup: {
				from: "videos",
				localField: "video",
				foreignField: "_id",
				as: "videoDetails",
				// Nested lookup to get the owner's details for each video.
				pipeline: [
					{
						$lookup: {
							from: "users",
							localField: "owner",
							foreignField: "_id",
							as: "ownerDetails",
						},
					},
					{
						$unwind: "$ownerDetails",
					},
				],
			},
		},
		{
			$unwind: "$videoDetails",
		},
		{
			// Project a clean, final structure for the response.
			$project: {
				_id: "$videoDetails._id",
				title: "$videoDetails.title",
				thumbnail: "$videoDetails.thumbnail.url",
				duration: "$videoDetails.duration",
				views: "$videoDetails.views",
				owner: {
					username: "$videoDetails.ownerDetails.username",
					avatar: "$videoDetails.ownerDetails.avatar.url",
				},
			},
		},
	]);

	return res
		.status(200)
		.json(
			new ApiResponse(200, "Liked videos fetched successfully", likedVideos)
		);
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
