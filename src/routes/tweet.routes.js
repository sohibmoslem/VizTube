import { Router } from "express";
import { authMid } from "../middlewares/auth.middlewares.js";
import {
	createTweet,
	deleteTweetById,
	getUserTweetsById,
	updateTweetById,
} from "../controllers/tweet.controllers.js";

const tweet = Router();
tweet.use(authMid);

tweet.post("/create-tweet", createTweet);
tweet.get("/get-user-tweets/:userId", getUserTweetsById);
tweet.patch("/update-tweet/:tweetId", updateTweetById);
tweet.delete("/delete-tweet/:tweetId", deleteTweetById);

export default tweet;
