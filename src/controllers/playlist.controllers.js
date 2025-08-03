import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { Video } from "../models/video.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @controller createPlaylist
 * @description Creates a new playlist for the logged-in user.
 */
const createPlaylist = asyncHandler(async (req, res) => {
	const { name, description } = req.body;

	if (
		!name ||
		!description ||
		name.trim() === "" ||
		description.trim() === ""
	) {
		throw new ApiError(400, "Name and description are required");
	}

	const playlist = await Playlist.create({
		name,
		description,
		owner: req.user?._id,
	});

	if (!playlist) {
		throw new ApiError(500, "Failed to create playlist");
	}

	return res
		.status(201)
		.json(new ApiResponse(201, "Playlist created successfully", playlist));
});

/**
 * @controller getUserPlaylists
 * @description Fetches all playlists created by a specific user.
 */
const getUserPlaylists = asyncHandler(async (req, res) => {
	const { userId } = req.params;
	if (!isValidObjectId(userId)) {
		throw new ApiError(400, "Invalid User ID");
	}

	const playlists = await Playlist.find({ owner: userId });

	// It's not an error if a user has no playlists; we return an empty array.
	return res
		.status(200)
		.json(
			new ApiResponse(200, "User playlists fetched successfully", playlists)
		);
});

/**
 * @controller getPlaylistById
 * @description Fetches a single playlist by its unique ID.
 */
const getPlaylistById = asyncHandler(async (req, res) => {
	const { playlistId } = req.params;
	if (!isValidObjectId(playlistId)) {
		throw new ApiError(400, "Invalid Playlist ID");
	}

	const playlist = await Playlist.findById(playlistId);
	if (!playlist) {
		throw new ApiError(404, "Playlist not found");
	}

	// TODO: Populate video details for a richer response.
	// const playlistWithVideos = await playlist.populate("videos");

	return res
		.status(200)
		.json(new ApiResponse(200, "Playlist fetched successfully", playlist));
});

/**
 * @controller addVideoToPlaylist
 * @description Adds a specified video to a specified playlist.
 * Only the owner of the playlist can add videos.
 */
const addVideoToPlaylist = asyncHandler(async (req, res) => {
	const { playlistId, videoId } = req.params;

	if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
		throw new ApiError(400, "Invalid Playlist or Video ID");
	}

	const playlist = await Playlist.findById(playlistId);
	const video = await Video.findById(videoId);

	if (!playlist) throw new ApiError(404, "Playlist not found");
	if (!video) throw new ApiError(404, "Video not found");

	// Authorization check: only the owner can modify the playlist.
	if (playlist.owner.toString() !== req.user?._id.toString()) {
		throw new ApiError(
			403,
			"You are not authorized to add videos to this playlist"
		);
	}

	// Prevent duplicate videos in the playlist.
	if (playlist.videos.includes(videoId)) {
		return res
			.status(200)
			.json(new ApiResponse(200, "Video is already in the playlist", playlist));
	}

	const updatedPlaylist = await Playlist.findByIdAndUpdate(
		playlistId,
		{ $push: { videos: videoId } },
		{ new: true }
	);

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				"Video added to playlist successfully",
				updatedPlaylist
			)
		);
});

/**
 * @controller removeVideoFromPlaylist
 * @description Removes a specified video from a specified playlist.
 * Only the owner of the playlist can remove videos.
 */
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
	const { playlistId, videoId } = req.params;

	if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
		throw new ApiError(400, "Invalid Playlist or Video ID");
	}

	const playlist = await Playlist.findById(playlistId);
	if (!playlist) throw new ApiError(404, "Playlist not found");

	// Authorization check.
	if (playlist.owner.toString() !== req.user?._id.toString()) {
		throw new ApiError(
			403,
			"You are not authorized to remove videos from this playlist"
		);
	}

	const updatedPlaylist = await Playlist.findByIdAndUpdate(
		playlistId,
		{ $pull: { videos: videoId } },
		{ new: true }
	);

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				"Video removed from playlist successfully",
				updatedPlaylist
			)
		);
});

/**
 * @controller deletePlaylist
 * @description Deletes a playlist owned by the logged-in user.
 */
const deletePlaylist = asyncHandler(async (req, res) => {
	const { playlistId } = req.params;
	if (!isValidObjectId(playlistId)) {
		throw new ApiError(400, "Invalid Playlist ID");
	}

	const playlist = await Playlist.findById(playlistId);
	if (!playlist) throw new ApiError(404, "Playlist not found");

	// Authorization check.
	if (playlist.owner.toString() !== req.user?._id.toString()) {
		throw new ApiError(403, "You are not authorized to delete this playlist");
	}

	await Playlist.findByIdAndDelete(playlistId);

	return res
		.status(200)
		.json(new ApiResponse(200, "Playlist deleted successfully", {}));
});

/**
 * @controller updatePlaylist
 * @description Updates the name and description of a playlist owned by the logged-in user.
 */
const updatePlaylist = asyncHandler(async (req, res) => {
	const { playlistId } = req.params;
	const { name, description } = req.body;

	if (!isValidObjectId(playlistId)) {
		throw new ApiError(400, "Invalid Playlist ID");
	}
	if (!name || !description) {
		throw new ApiError(400, "Name and description are required");
	}

	const playlist = await Playlist.findById(playlistId);
	if (!playlist) throw new ApiError(404, "Playlist not found");

	// Authorization check.
	if (playlist.owner.toString() !== req.user?._id.toString()) {
		throw new ApiError(403, "You are not authorized to update this playlist");
	}

	const updatedPlaylist = await Playlist.findByIdAndUpdate(
		playlistId,
		{ $set: { name, description } },
		{ new: true }
	);

	return res
		.status(200)
		.json(
			new ApiResponse(200, "Playlist updated successfully", updatedPlaylist)
		);
});

export {
	createPlaylist,
	getUserPlaylists,
	getPlaylistById,
	addVideoToPlaylist,
	removeVideoFromPlaylist,
	deletePlaylist,
	updatePlaylist,
};
