import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.models.js";
import { Video } from "../models/video.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @controller getVideoComments
 * @description Fetches all comments for a specific video with pagination.
 */
const getVideoComments = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	const { page = 1, limit = 10 } = req.query;

	if (!isValidObjectId(videoId)) {
		throw new ApiError(400, "Invalid Video ID");
	}

	const video = await Video.findById(videoId);
	if (!video) {
		throw new ApiError(404, "Video not found");
	}

	// Create an aggregation pipeline to fetch comments and their owner's details.
	const commentsAggregate = Comment.aggregate([
		{
			$match: {
				video: new mongoose.Types.ObjectId(videoId),
			},
		},
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
		{
			$sort: {
				createdAt: -1,
			},
		},
		{
			// Project a clean, final structure for the response.
			$project: {
				_id: 1,
				content: 1,
				createdAt: 1,
				owner: {
					username: "$ownerDetails.username",
					fullName: "$ownerDetails.fullName",
					avatar: "$ownerDetails.avatar.url",
				},
			},
		},
	]);

	const options = {
		page: parseInt(page, 10),
		limit: parseInt(limit, 10),
	};

	const comments = await Comment.aggregatePaginate(commentsAggregate, options);

	return res
		.status(200)
		.json(new ApiResponse(200, "Comments fetched successfully", comments));
});

/**
 * @controller addComment
 * @description Adds a new comment to a video on behalf of the logged-in user.
 */
const addComment = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	const { content } = req.body;

	if (!content || content.trim() === "") {
		throw new ApiError(400, "Comment content is required");
	}

	if (!isValidObjectId(videoId)) {
		throw new ApiError(400, "Invalid Video ID");
	}

	const video = await Video.findById(videoId);
	if (!video) {
		throw new ApiError(404, "Video not found");
	}

	const comment = await Comment.create({
		content,
		video: videoId,
		owner: req.user?._id,
	});

	if (!comment) {
		throw new ApiError(500, "Failed to add comment");
	}

	return res
		.status(201)
		.json(new ApiResponse(201, "Comment added successfully", comment));
});

/**
 * @controller updateComment
 * @description Updates the content of a comment owned by the logged-in user.
 */
const updateComment = asyncHandler(async (req, res) => {
	const { commentId } = req.params;
	const { content } = req.body;

	if (!content || content.trim() === "") {
		throw new ApiError(400, "Comment content is required");
	}

	if (!isValidObjectId(commentId)) {
		throw new ApiError(400, "Invalid Comment ID");
	}

	const comment = await Comment.findById(commentId);
	if (!comment) {
		throw new ApiError(404, "Comment not found");
	}

	// Authorization check: only the owner can update their comment.
	if (comment.owner.toString() !== req.user?._id.toString()) {
		throw new ApiError(403, "You are not authorized to update this comment");
	}

	const updatedComment = await Comment.findByIdAndUpdate(
		commentId,
		{ $set: { content } },
		{ new: true }
	);

	return res
		.status(200)
		.json(new ApiResponse(200, "Comment updated successfully", updatedComment));
});

/**
 * @controller deleteComment
 * @description Deletes a comment owned by the logged-in user.
 */
const deleteComment = asyncHandler(async (req, res) => {
	const { commentId } = req.params;

	if (!isValidObjectId(commentId)) {
		throw new ApiError(400, "Invalid Comment ID");
	}

	const comment = await Comment.findById(commentId);
	if (!comment) {
		throw new ApiError(404, "Comment not found");
	}

	// Authorization check: only the owner can delete their comment.
	if (comment.owner.toString() !== req.user?._id.toString()) {
		throw new ApiError(403, "You are not authorized to delete this comment");
	}

	await Comment.findByIdAndDelete(commentId);

	return res
		.status(200)
		.json(new ApiResponse(200, "Comment deleted successfully", {}));
});

export { getVideoComments, addComment, updateComment, deleteComment };
