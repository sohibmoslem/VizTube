import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

/**
 * @schema CommentSchema
 * @description Mongoose schema for the Comment model.
 * Defines the structure for comment documents, which are associated with videos.
 */
const commentSchema = new Schema(
	{
		content: {
			type: String,
			required: true,
		},
		video: {
			type: Schema.Types.ObjectId,
			ref: "Video", // Creates a reference to the Video the comment belongs to.
		},
		owner: {
			type: Schema.Types.ObjectId,
			ref: "User", // Creates a reference to the User who wrote the comment.
		},
	},
	{ timestamps: true } // Automatically adds createdAt and updatedAt fields.
);

/**
 * Plugin for Mongoose to add pagination support to aggregation queries.
 * This is useful for fetching comments in pages.
 */
commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);
