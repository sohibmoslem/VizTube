import { Router } from "express";
import {
	getChannelStats,
	getChannelVideos,
} from "../controllers/dashboard.controllers.js";
import { authMid } from "../middlewares/auth.middlewares.js";

const dashboard = Router();

dashboard.use(authMid); // Apply auth middleware to all routes in this file

dashboard.get("/stats", getChannelStats);
dashboard.get("/videos", getChannelVideos);

export default dashboard;
