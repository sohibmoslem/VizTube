import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.models.js";

/**
 * @controller toggleSubscription
 * @description Toggles the subscription status for the logged-in user to a specific channel.
 * If the user is already subscribed, it unsubscribes them. Otherwise, it subscribes them.
 */
const toggleSubscription = asyncHandler(async (req, res) => {
	const { channelId } = req.params;
	const subscriberId = req.user?._id;

	if (!isValidObjectId(channelId)) {
		throw new ApiError(400, "Invalid channel ID");
	}

	// Find if a subscription document already exists.
	const existingSubscription = await Subscription.findOne({
		subscriber: subscriberId,
		channel: channelId,
	});

	if (existingSubscription) {
		// If it exists, delete it (unsubscribe).
		await Subscription.findByIdAndDelete(existingSubscription._id);
		return res
			.status(200)
			.json(
				new ApiResponse(200, "Unsubscribed successfully", { subscribed: false })
			);
	} else {
		// If it doesn't exist, create it (subscribe).
		await Subscription.create({
			subscriber: subscriberId,
			channel: channelId,
		});
		return res
			.status(201)
			.json(
				new ApiResponse(201, "Subscribed successfully", { subscribed: true })
			);
	}
});

/**
 * @controller getUserChannelSubscribers
 * @description Fetches a list of all users who are subscribed to a specific channel.
 */
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
	const { channelId } = req.params;
	if (!isValidObjectId(channelId)) {
		throw new ApiError(400, "Invalid channel ID");
	}

	const subscribers = await Subscription.aggregate([
		{
			$match: {
				channel: new mongoose.Types.ObjectId(channelId),
			},
		},
		{
			// Join with the 'users' collection to get details of each subscriber.
			$lookup: {
				from: "users",
				localField: "subscriber",
				foreignField: "_id",
				as: "subscriberDetails",
			},
		},
		{
			$unwind: "$subscriberDetails",
		},
		{
			// Project a clean structure for the response.
			$project: {
				_id: "$subscriberDetails._id",
				username: "$subscriberDetails.username",
				fullName: "$subscriberDetails.fullName",
				avatar: "$subscriberDetails.avatar.url",
			},
		},
	]);

	return res
		.status(200)
		.json(
			new ApiResponse(200, "Subscribers fetched successfully", subscribers)
		);
});

/**
 * @controller getSubscribedChannels
 * @description Fetches a list of all channels that a specific user is subscribed to.
 */
const getSubscribedChannels = asyncHandler(async (req, res) => {
	const { subscriberId } = req.params;
	if (!isValidObjectId(subscriberId)) {
		throw new ApiError(400, "Invalid subscriber ID");
	}

	const subscribedChannels = await Subscription.aggregate([
		{
			$match: {
				subscriber: new mongoose.Types.ObjectId(subscriberId),
			},
		},
		{
			// Join with the 'users' collection to get details of each channel.
			$lookup: {
				from: "users",
				localField: "channel",
				foreignField: "_id",
				as: "channelDetails",
			},
		},
		{
			$unwind: "$channelDetails",
		},
		{
			// Project a clean structure for the response.
			$project: {
				_id: "$channelDetails._id",
				username: "$channelDetails.username",
				fullName: "$channelDetails.fullName",
				avatar: "$channelDetails.avatar.url",
			},
		},
	]);

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				"Subscribed channels fetched successfully",
				subscribedChannels
			)
		);
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
