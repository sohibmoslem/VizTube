import { Router } from "express";
import {
	addVideoToPlaylist,
	createPlaylist,
	deletePlaylist,
	getPlaylistById,
	getUserPlaylists,
	removeVideoFromPlaylist,
	updatePlaylist,
} from "../controllers/playlist.controllers.js";
import { authMid } from "../middlewares/auth.middlewares.js";

const playlist = Router();
playlist.use(authMid); // Apply auth to all playlist routes

playlist.post("/create-playlist", createPlaylist);
playlist.get("/get-user-playlists/:userId", getUserPlaylists);
playlist.get("/get-playlist-by-id/:playlistId", getPlaylistById); // Corrected typo for consistency
playlist.patch(
	"/add-video-to-playlist/:playlistId/:videoId",
	addVideoToPlaylist
);
playlist.patch(
	"/remove-video-from-playlist/:playlistId/:videoId",
	removeVideoFromPlaylist
);
playlist.delete("/delete-playlist/:playlistId", deletePlaylist);
playlist.patch("/update-playlist/:playlistId", updatePlaylist);

export default playlist;
