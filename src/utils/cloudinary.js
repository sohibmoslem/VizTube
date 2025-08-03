import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

/**
 * @description Configures the Cloudinary SDK with credentials from environment variables.
 * This function is called just-in-time to prevent module loading order issues.
 */
const configureCloudinary = () => {
	cloudinary.config({
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET,
	});
};

/**
 * Uploads a file from a local path to Cloudinary.
 * It handles the configuration, upload, and cleanup of the local file.
 *
 * @param {string} localFilePath - The absolute path to the file on the local server.
 * @returns {Promise<Object|null>} A Promise that resolves with the Cloudinary response object on success, or null on failure.
 */
const uploadOnCloudinary = async (localFilePath) => {
	// Configure Cloudinary right before the upload attempt.
	configureCloudinary();

	try {
		if (!localFilePath) return null;

		// Upload the file to Cloudinary, automatically detecting the resource type (image/video).
		const response = await cloudinary.uploader.upload(localFilePath, {
			resource_type: "auto",
		});

		// The upload was successful, so we can safely remove the temporary local file.
		fs.unlinkSync(localFilePath);
		return response;
	} catch (error) {
		// If the upload fails, attempt to remove the temporary local file to clean up.
		if (fs.existsSync(localFilePath)) {
			fs.unlinkSync(localFilePath);
		}
		console.error("Cloudinary upload failed:", error);
		return null;
	}
};

/**
 * Deletes a file from Cloudinary using its public ID.
 *
 * @param {string} publicId - The public ID of the resource to delete.
 * @param {string} [resourceType="image"] - The type of the resource ('image', 'video', etc.).
 * @returns {Promise<Object|null>} A Promise that resolves with the Cloudinary response on success, or null on failure.
 */
const deleteFromCloudinary = async (publicId, resourceType = "image") => {
	// Configure Cloudinary right before the delete attempt.
	configureCloudinary();

	try {
		if (!publicId) return null;

		// Call the Cloudinary API to destroy the specified asset.
		const result = await cloudinary.uploader.destroy(publicId, {
			resource_type: resourceType,
		});
		return result;
	} catch (error) {
		console.error("Cloudinary delete failed:", error);
		return null;
	}
};

export { uploadOnCloudinary, deleteFromCloudinary };
