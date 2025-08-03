import mongoose, { Schema } from "mongoose";

/**
 * @schema PlaylistSchema
 * @description Mongoose schema for the Playlist model.
 * Defines the structure for user-created playlists that can contain multiple videos.
 */
const playlistSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		// An array of ObjectIds, each referencing a document in the 'Video' collection.
		videos: [
			{
				type: Schema.Types.ObjectId,
				ref: "Video",
			},
		],
		// The user who created and owns this playlist.
		owner: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{ timestamps: true } // Automatically adds createdAt and updatedAt fields.
);

export const Playlist = mongoose.model("Playlist", playlistSchema);
