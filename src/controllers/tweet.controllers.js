import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @controller createTweet
 * @description Creates a new tweet for the logged-in user.
 */
const createTweet = asyncHandler(async (req, res) => {
	const { content } = req.body;
	const ownerId = req.user?._id;

	if (!content || content.trim() === "") {
		throw new ApiError(400, "Content is required");
	}

	const tweet = await Tweet.create({
		content,
		owner: ownerId,
	});

	if (!tweet) {
		throw new ApiError(500, "Failed to create tweet, please try again.");
	}

	return res
		.status(201)
		.json(new ApiResponse(201, "Tweet created successfully", tweet));
});

/**
 * @controller getUserTweetsById
 * @description Fetches all tweets created by a specific user.
 */
const getUserTweetsById = asyncHandler(async (req, res) => {
	const { userId } = req.params;

	if (!isValidObjectId(userId)) {
		throw new ApiError(400, "Invalid User ID");
	}

	// Aggregation pipeline to fetch tweets and join with user data for owner details.
	const tweets = await Tweet.aggregate([
		{
			$match: {
				owner: new mongoose.Types.ObjectId(userId),
			},
		},
		{
			$lookup: {
				from: "users",
				localField: "owner",
				foreignField: "_id",
				as: "ownerDetails",
				pipeline: [
					{
						$project: {
							username: 1,
							avatar: "$avatar.url",
						},
					},
				],
			},
		},
		{
			$unwind: "$ownerDetails",
		},
		{
			// Project a clean structure for the final response.
			$project: {
				_id: 1,
				content: 1,
				createdAt: 1,
				owner: "$ownerDetails",
				// TODO: Add like count for each tweet here using another $lookup.
			},
		},
		{
			$sort: { createdAt: -1 },
		},
	]);

	return res
		.status(200)
		.json(new ApiResponse(200, "Tweets fetched successfully", tweets));
});

/**
 * @controller updateTweetById
 * @description Updates the content of a tweet owned by the logged-in user.
 */
const updateTweetById = asyncHandler(async (req, res) => {
	const { tweetId } = req.params;
	const { content } = req.body;

	if (!content || content.trim() === "") {
		throw new ApiError(400, "Content is required");
	}
	if (!isValidObjectId(tweetId)) {
		throw new ApiError(400, "Invalid Tweet ID");
	}

	const tweet = await Tweet.findById(tweetId);
	if (!tweet) {
		throw new ApiError(404, "Tweet not found");
	}

	// Authorization check: only the owner can update their tweet.
	if (tweet.owner.toString() !== req.user?._id.toString()) {
		throw new ApiError(403, "You are not authorized to update this tweet");
	}

	const updatedTweet = await Tweet.findByIdAndUpdate(
		tweetId,
		{ $set: { content } },
		{ new: true }
	);

	return res
		.status(200)
		.json(new ApiResponse(200, "Tweet updated successfully", updatedTweet));
});

/**
 * @controller deleteTweetById
 * @description Deletes a tweet owned by the logged-in user.
 */
const deleteTweetById = asyncHandler(async (req, res) => {
	const { tweetId } = req.params;

	if (!isValidObjectId(tweetId)) {
		throw new ApiError(400, "Invalid Tweet ID");
	}

	const tweet = await Tweet.findById(tweetId);
	if (!tweet) {
		throw new ApiError(404, "Tweet not found");
	}

	// Authorization check: only the owner can delete their tweet.
	if (tweet.owner.toString() !== req.user?._id.toString()) {
		throw new ApiError(403, "You are not authorized to delete this tweet");
	}

	await Tweet.findByIdAndDelete(tweetId);

	return res
		.status(200)
		.json(new ApiResponse(200, "Tweet deleted successfully", {}));
});

export { createTweet, getUserTweetsById, updateTweetById, deleteTweetById };
