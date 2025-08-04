import express from "express";
import cookieParser from "cookie-parser";

// --- Route Imports ---
// Import all the route handlers for different features.
import auth from "./src/routes/user.routes.js";
import video from "./src/routes/video.routes.js";
import tweet from "./src/routes/tweet.routes.js";
import like from "./src/routes/like.routes.js";
import comment from "./src/routes/comment.routes.js";
import playlist from "./src/routes/playlist.routes.js";
import subscription from "./src/routes/subscription.routes.js";
import dashboard from "./src/routes/dashboard.routes.js";

const app = express();

// --- Global Middleware ---
// Allows Express to parse URL-encoded data (e.g., from HTML forms).
app.use(express.urlencoded({ extended: true }));
// Allows Express to parse JSON data in the request body.
app.use(express.json());
// Allows the server to read and set cookies. Essential for auth.
app.use(cookieParser());
// This will make your index.html the default page for the root URL.
app.use(express.static("public"));

// ====================================================================
//  HEALTH CHECK ROUTE
// ====================================================================
app.get("/", (req, res) => {
	res.status(200).json({
		status: "ok",
		message: "VizTube API is live and running!",
	});
});
// ====================================================================

// --- API Routes ---
// Mounts all the feature-specific routers to the main application under the /api/v1 prefix.
app.use("/api/v1/user", auth);
app.use("/api/v1/video", video);
app.use("/api/v1/tweet", tweet);
app.use("/api/v1/like", like);
app.use("/api/v1/comment", comment);
app.use("/api/v1/playlist", playlist);
app.use("/api/v1/subscription", subscription);
app.use("/api/v1/dashboard", dashboard);

export default app;
