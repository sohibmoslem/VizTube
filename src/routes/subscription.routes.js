import { Router } from "express";
import {
	getSubscribedChannels,
	getUserChannelSubscribers,
	toggleSubscription,
} from "../controllers/subscription.controller.js";
import { authMid } from "../middlewares/auth.middlewares.js";

const subscription = Router();

subscription.use(authMid);

subscription.post("/toggle-subscription/:channelId", toggleSubscription);
subscription.get("/get-subscribers/:channelId", getUserChannelSubscribers);
subscription.get(
	"/get-subscribed-channels/:subscriberId",
	getSubscribedChannels
);

export default subscription;
