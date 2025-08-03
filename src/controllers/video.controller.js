import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
	uploadOnCloudinary,
	deleteFromCloudinary,
} from "../utils/cloudinary.js";

/**
 * @controller getAllVideos
 * @description Fetches a paginated list of videos with support for searching, sorting, and filtering by user.
 * Requires a MongoDB Atlas Search Index named 'search-videos' for the query functionality.
 */
const getAllVideos = asyncHandler(async (req, res) => {
	const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

	const pipeline = [];

	// Add a search stage if a query is provided.
	if (query) {
		pipeline.push({
			$search: {
				index: "search-videos",
				text: {
					query: query,
					path: ["title", "description"],
				},
			},
		});
	}

	// Filter by a specific user if a userId is provided.
	if (userId) {
		if (!isValidObjectId(userId)) {
			throw new ApiError(400, "Invalid userId");
		}
		pipeline.push({
			$match: {
				owner: new mongoose.Types.ObjectId(userId),
			},
		});
	}

	// Only fetch videos that are marked as published.
	pipeline.push({ $match: { isPublished: true } });

	// Add a sorting stage based on query parameters, or default to newest.
	if (sortBy && sortType) {
		pipeline.push({
			$sort: {
				[sortBy]: sortType === "desc" ? -1 : 1,
			},
		});
	} else {
		pipeline.push({ $sort: { createdAt: -1 } });
	}

	// Join with the users collection to get owner details.
	pipeline.push(
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
		}
	);

	const videoAggregate = Video.aggregate(pipeline);

	const options = {
		page: parseInt(page, 10),
		limit: parseInt(limit, 10),
	};

	const videos = await Video.aggregatePaginate(videoAggregate, options);

	return res
		.status(200)
		.json(new ApiResponse(200, "Videos fetched successfully", videos));
});

/**
 * @controller publishAVideo
 * @description Handles the upload of a new video and its thumbnail to Cloudinary and saves the details to the database.
 */
const publishAVideo = asyncHandler(async (req, res) => {
	const { title, description } = req.body;
	if (!title || !description) {
		throw new ApiError(400, "Title and description are required.");
	}

	// Get local file paths from multer middleware.
	const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
	const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

	if (!videoFileLocalPath) throw new ApiError(400, "Video file is required.");
	if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail is required.");

	// Upload files to Cloudinary.
	const videoFile = await uploadOnCloudinary(videoFileLocalPath);
	const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

	if (!videoFile) throw new ApiError(500, "Failed to upload video.");
	if (!thumbnail) throw new ApiError(500, "Failed to upload thumbnail.");

	// Create video document in the database.
	const video = await Video.create({
		title,
		description,
		videoFile: { url: videoFile.url, public_id: videoFile.public_id },
		thumbnail: { url: thumbnail.url, public_id: thumbnail.public_id },
		duration: videoFile.duration,
		owner: req.user?._id,
	});

	return res
		.status(201)
		.json(new ApiResponse(201, "Video published successfully", video));
});

/**
 * @controller getVideoById
 * @description Fetches a single video by its unique ID.
 */
const getVideoById = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	if (!isValidObjectId(videoId)) {
		throw new ApiError(400, "Invalid Video ID");
	}

	const video = await Video.findById(videoId);
	if (!video) {
		throw new ApiError(404, "Video not found");
	}

	// TODO: Increment view count here.
	// TODO: Add video to user's watch history if they are logged in.

	return res
		.status(200)
		.json(new ApiResponse(200, "Video fetched successfully", video));
});

/**
 * @controller updateVideo
 * @description Updates the details (title, description, thumbnail) of a video owned by the logged-in user.
 */
const updateVideo = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	const { title, description } = req.body;
	const thumbnailLocalPath = req.file?.path; // For new thumbnail uploads.

	if (!isValidObjectId(videoId)) {
		throw new ApiError(400, "Invalid Video ID");
	}

	const video = await Video.findById(videoId);
	if (!video) {
		throw new ApiError(404, "Video not found");
	}

	// Authorization check: only the owner can update the video.
	if (video.owner.toString() !== req.user?._id.toString()) {
		throw new ApiError(403, "You are not authorized to update this video");
	}

	const updateData = {};
	if (title) updateData.title = title;
	if (description) updateData.description = description;

	// If a new thumbnail is provided, upload it and update the reference.
	if (thumbnailLocalPath) {
		const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
		if (!newThumbnail?.url) {
			throw new ApiError(500, "Error uploading new thumbnail");
		}
		updateData.thumbnail = {
			url: newThumbnail.url,
			public_id: newThumbnail.public_id,
		};
		// Clean up the old thumbnail from Cloudinary.
		if (video.thumbnail?.public_id) {
			await deleteFromCloudinary(video.thumbnail.public_id, "image");
		}
	}

	const updatedVideo = await Video.findByIdAndUpdate(
		videoId,
		{ $set: updateData },
		{ new: true }
	);

	return res
		.status(200)
		.json(
			new ApiResponse(200, "Video details updated successfully", updatedVideo)
		);
});

/**
 * @controller deleteVideo
 * @description Deletes a video owned by the logged-in user, including its assets on Cloudinary.
 */
const deleteVideo = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	if (!isValidObjectId(videoId)) {
		throw new ApiError(400, "Invalid Video ID");
	}

	const video = await Video.findById(videoId);
	if (!video) {
		throw new ApiError(404, "Video not found");
	}

	// Authorization check: only the owner can delete the video.
	if (video.owner.toString() !== req.user?._id.toString()) {
		throw new ApiError(403, "You are not authorized to delete this video");
	}

	// Delete video and thumbnail files from Cloudinary.
	if (video.videoFile?.public_id) {
		await deleteFromCloudinary(video.videoFile.public_id, "video");
	}
	if (video.thumbnail?.public_id) {
		await deleteFromCloudinary(video.thumbnail.public_id, "image");
	}

	// Delete the video document from the database.
	await Video.findByIdAndDelete(videoId);

	return res
		.status(200)
		.json(new ApiResponse(200, "Video deleted successfully", {}));
});

/**
 * @controller togglePublishStatus
 * @description Toggles the 'isPublished' status of a video owned by the logged-in user.
 */
const togglePublishStatus = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	if (!isValidObjectId(videoId)) {
		throw new ApiError(400, "Invalid Video ID");
	}

	const video = await Video.findById(videoId);
	if (!video) {
		throw new ApiError(404, "Video not found");
	}

	// Authorization check: only the owner can change the status.
	if (video.owner.toString() !== req.user?._id.toString()) {
		throw new ApiError(
			403,
			"You are not authorized to change this video's status"
		);
	}

	// Toggle the status and save the document.
	video.isPublished = !video.isPublished;
	await video.save({ validateBeforeSave: false });

	return res.status(200).json(
		new ApiResponse(200, "Publish status toggled successfully", {
			isPublished: video.isPublished,
		})
	);
});

export {
	getAllVideos,
	publishAVideo,
	getVideoById,
	updateVideo,
	deleteVideo,
	togglePublishStatus,
};
