import { Router } from "express";
import {
	deleteVideo,
	getAllVideos,
	getVideoById,
	publishAVideo,
	togglePublishStatus,
	updateVideo,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { authMid } from "../middlewares/auth.middlewares.js";

const video = Router();

video.post(
	"/upload-video",
	authMid,
	upload.fields([
		{ name: "videoFile", maxCount: 1 },
		{ name: "thumbnail", maxCount: 1 },
	]),
	publishAVideo
);

video.get("/get-video-by-id/:videoId", authMid, getVideoById);
video.patch("/update-video/:videoId", authMid, updateVideo);
video.delete("/delete-video/:videoId", authMid, deleteVideo);
video.patch("/toggle-publish-status/:videoId", authMid, togglePublishStatus);
video.get("/", getAllVideos);
export default video;
