import mongoose, { Schema } from "mongoose";

/**
 * @schema TweetSchema
 * @description Mongoose schema for the Tweet model.
 * Defines the structure for tweet documents, representing short text-based posts by users.
 */
const tweetSchema = new Schema(
	{
		content: {
			type: String,
			required: true,
		},
		owner: {
			type: Schema.Types.ObjectId,
			ref: "User", // Creates a reference to the User who created the tweet.
		},
	},
	{ timestamps: true } // Automatically adds createdAt and updatedAt fields.
);

export const Tweet = mongoose.model("Tweet", tweetSchema);
