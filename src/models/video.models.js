import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

/**
 * @schema VideoSchema
 * @description Mongoose schema for the Video model.
 * Defines the structure for video documents in the database.
 */
const videoSchema = new Schema(
	{
		videoFile: {
			url: { type: String, required: true }, // Public URL from Cloudinary.
			public_id: { type: String, required: true }, // ID from Cloudinary, used for deletion.
		},
		thumbnail: {
			url: { type: String, required: true }, // Public URL from Cloudinary.
			public_id: { type: String, required: true }, // ID from Cloudinary, used for deletion.
		},
		title: {
			type: String,
			required: true,
			index: true, // Improves search performance for titles.
		},
		description: {
			type: String,
			required: true,
		},
		views: {
			type: Number,
			default: 0,
		},
		duration: {
			type: Number, // Duration in seconds, provided by Cloudinary.
			required: true,
		},
		isPublished: {
			type: Boolean,
			default: true,
		},
		owner: {
			type: Schema.Types.ObjectId,
			ref: "User", // Creates a reference to the User model.
		},
	},
	{ timestamps: true } // Automatically adds createdAt and updatedAt fields.
);

/**
 * Plugin for Mongoose to add pagination support to aggregation queries.
 * This is essential for features like infinite scrolling or paginated video listings.
 */
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
