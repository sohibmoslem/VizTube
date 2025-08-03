import mongoose, { Schema } from "mongoose";

/**
 * @schema SubscriptionSchema
 * @description Mongoose schema for the Subscription model.
 * This model represents the relationship between two users: a 'subscriber' and a 'channel'.
 * Each document in this collection signifies that one user is subscribed to another.
 */
const subscriptionSchema = new Schema(
	{
		// The user who is performing the subscription action.
		subscriber: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		// The user (channel) who is being subscribed to.
		channel: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{ timestamps: true } // Automatically adds createdAt and updatedAt fields.
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
