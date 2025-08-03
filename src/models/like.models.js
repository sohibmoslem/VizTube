import mongoose, { Schema } from "mongoose";

/**
 * @schema LikeSchema
 * @description Mongoose schema for the Like model.
 * This model represents a polymorphic "like" that can be associated with a video,
 * a comment, or a tweet.
 */
const likeSchema = new Schema(
	{
		// A like must be associated with ONE of the following three fields.
		video: {
			type: Schema.Types.ObjectId,
			ref: "Video",
		},
		comment: {
			type: Schema.Types.ObjectId,
			ref: "Comment",
		},
		tweet: {
			type: Schema.Types.ObjectId,
			ref: "Tweet",
		},
		// The user who performed the "like" action.
		likedBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true } // Automatically adds createdAt and updatedAt fields.
);

export const Like = mongoose.model("Like", likeSchema);
