# VizTube API: Postman Testing Guide

This comprehensive guide provides step-by-step instructions for setting up and using the VizTube API Postman collection. Follow these instructions to test every endpoint in the application, from user registration to advanced dashboard analytics.

## 🚀 Quick Start (TL;DR)

For experienced users who want to get started immediately:

1. Import `VizTube.postman_collection.json` into Postman
2. Create environment "VizTube Local" with `baseURL: http://localhost:8000/api/v1`
3. Run `POST register` → `POST login` (token auto-saves)
4. Test protected endpoints (auth inherits automatically)
5. Follow the recommended testing flow for comprehensive coverage

## 📋 Prerequisites

Before starting, ensure you have:

- **Postman Desktop App**: The latest version installed on your machine.
- **Running VizTube Server**: The backend server must be running locally (`npm run dev`). The server should be accessible at `http://localhost:8000`.

## 🚀 Initial Setup

### Step 1: Import the API Collection

The repository includes a pre-configured Postman collection with all API requests organized by functionality.

1. Download the `VizTube.postman_collection.json` file from the repository root.
2. Open Postman and click the **Import** button (top-left corner).
3. Drag and drop the JSON file into the import window.
4. **Verify Import**: The "VizTube" collection should appear in your workspace with organized folders.

### Step 2: Configure Environment Variables

Environment variables streamline testing by managing the base URL and authentication tokens automatically.

**Create Environment:**

1. Navigate to the **Environments** tab (left sidebar).
2. Click the **+** button to create a new environment.
3. Name it "VizTube Local".

**Add Variables:**

| Variable    | Initial Value                | Description                |
| ----------- | ---------------------------- | -------------------------- |
| baseURL     | http://localhost:8000/api/v1 | API base endpoint          |
| accessToken | (leave empty)                | Auto-populated after login |

**Activate Environment:**

1. Select "VizTube Local" from the environment dropdown in the top-right corner.
2. Ensure it shows as active (not "No Environment").
   x

## 🔐 Authentication Workflow

All protected routes require authentication. Follow this sequence to obtain and use access tokens.

### Step 1: User Registration

1. Navigate to **users** folder → **POST register** request.
2. **Configure Request Body:**
   - Select the **Body** tab and choose the **form-data** format.
   - Fill in the required fields (`fullName`, `username`, `email`, `password`).
   - For the `avatar` and `coverImage` keys, change the type from **Text** to **File** and select images from your computer.
3. **Send Request**: Click **Send** and verify you receive a **201 Created** status.

### Step 2: User Login & Token Acquisition

1. Open **POST login** request.
2. **Configure Request Body:**
   - Select the **Body** tab, choose **raw**, and set the type to **JSON**.
   - Enter the login credentials for the user you just registered.
3. **Send Request**: Click **Send**.
4. **Automatic Token Capture (The Magic Step):**
   - Upon a successful **200 OK** response, a script in the **Tests** tab automatically extracts the `accessToken` and saves it to your `{{accessToken}}` environment variable.
   - No manual copying is required.

## 🛡️ Testing Protected Endpoints

All protected endpoints are pre-configured with automatic authentication using the `{{accessToken}}` variable.

### Authentication Configuration

- **Parent Folder Auth**: The main collection is set to "Bearer Token" with `{{accessToken}}`.
- **Request Auth**: Individual requests are set to "Inherit auth from parent".
- **Automatic Headers**: The Authorization header is added automatically to every request.

### Testing Workflow

After a successful login, you can immediately test any protected endpoint:

- **User Profile**: `GET current-user-details`
- **Video Upload**: `POST upload`
- **Create Playlist**: `POST create-playlist`
- **Dashboard Stats**: `GET stats`

### Troubleshooting Authentication

**Problem**: 401 Unauthorized - "Invalid or expired access token"

**Solution**: Your access token has expired. Simply re-run the **POST login** request to refresh the token. The environment variable will be updated automatically.

## 📊 API Endpoint Categories

### 👤 User Management

- **Registration**: Create new user accounts.
- **Authentication**: Login/logout functionality and token refreshing.
- **Profile**: Update user details, avatar, and cover image.
- **Password**: Change user passwords.

### 🎥 Video Operations

- **Upload**: Post new videos with thumbnails to Cloudinary.
- **Browse**: Get all videos with pagination, sorting, and filtering.
- **Details**: Retrieve specific video information by its ID.
- **Management**: Update/delete a user's own videos.
- **Search**: Find videos by keywords using Atlas Search.

### 👍 Social Features

- **Likes**: Toggle likes on videos, comments, and tweets.
- **Comments**: Full CRUD operations for video comments.
- **Subscriptions**: Subscribe/unsubscribe from channels and view subscriber lists.

### 📚 Content Organization

- **Playlists**: Create, manage, and organize video collections. Add and remove videos from playlists.

### 📊 Analytics & Dashboard

- **Channel Stats**: Get aggregated statistics (views, subscribers, likes count).
- **Video Analytics**: Get a list of all videos uploaded by the logged-in user.

## 🧪 Testing Best Practices

### Recommended Testing Flow

For a comprehensive test, follow this logical order. This ensures you have the necessary data (like user IDs, video IDs, etc.) for subsequent requests.

1. Start with user registration and login.
2. Test user profile endpoints (`GET current-user-details`, `PATCH change-password`).
3. Upload a test video (`POST upload`). Copy the `_id` from the response.
4. Interact with the new video: test liking, commenting, and adding it to a playlist.
5. Verify the `GET stats` endpoint in the dashboard folder to see your aggregated data.

### Data Management

- Use unique and consistent test data across requests to avoid conflicts (e.g., use `testuser1`, `testuser2`).
- After testing a **DELETE** endpoint, verify the resource is gone by trying to **GET** it again (you should receive a **404 Not Found**).

### Error Handling

- Test invalid inputs (e.g., missing fields, incorrect data types) to verify you receive **4xx** error codes with clear messages.
- Test authorization by trying to modify another user's content to ensure you get a **403 Forbidden** response.

## ✅ Testing Checklist

Use this checklist to ensure comprehensive API testing:

### Initial Setup

- [ ] Postman collection imported successfully
- [ ] Environment variables configured (`baseURL`, `accessToken`)
- [ ] Server running on `http://localhost:8000`

### Authentication Flow

- [ ] User registration works (201 status)
- [ ] User login successful (200 status, token auto-saved)
- [ ] Protected endpoints accessible with token

### Core Functionality

- [ ] User profile operations (GET, PATCH)
- [ ] Video upload and management
- [ ] Social features (likes, comments, subscriptions)
- [ ] Playlist operations
- [ ] Dashboard analytics

### Error Handling

- [ ] 401 responses for invalid/expired tokens
- [ ] 403 responses for unauthorized actions
- [ ] 404 responses for non-existent resources
- [ ] 400 responses for invalid input data

## 🚨 Common Issues & Solutions

### Server Connection

**Issue**: "Could not send request" or connection refused errors.

**Solution**:

- Ensure your VizTube server is running locally on the correct port (`npm run dev`)
- Check if another process is using port 8000
- Verify the server logs for any startup errors

### File Uploads

**Issue**: File upload failures or MulterError.

**Solution**:

- Check that the field names in your form-data request (`videoFile`, `thumbnail`, etc.) exactly match what the server-side route expects
- Ensure you are changing the field type from **Text** to **File** in Postman
- Verify file size limits aren't exceeded
- Check file format compatibility

### Token Expiration

**Issue**: Frequent 401 errors.

**Solution**: Your access token has expired. Re-run the **POST login** request to get a new one.

### Environment Variables

**Issue**: `{{baseURL}}` or `{{accessToken}}` not resolving.

**Solution**:

- Ensure the correct environment is selected in the top-right dropdown
- Check that variable names match exactly (case-sensitive)
- Verify the login script properly saves the token to environment variables

### Request Body Issues

**Issue**: 400 Bad Request errors with valid-looking data.

**Solution**:

- Ensure JSON requests have `Content-Type: application/json` header
- Check for trailing commas in JSON
- Verify required fields are included and properly formatted

## 🔄 Environment Management

This collection is set up for local testing, but you can easily adapt it for other environments.

### Creating Multiple Environments

1. **Local Development**:

   - Environment: "VizTube Local"
   - baseURL: `http://localhost:8000/api/v1`

2. **Staging/Production**:
   - Create a new **Environment** in Postman (e.g., "VizTube Production")
   - Update the `baseURL` variable to your live server's URL (e.g., `https://viztube.onrender.com/api/v1`)

### Switching Between Environments

1. Use the environment dropdown in the top-right corner of Postman
2. Select the appropriate environment before testing
3. Verify the correct `baseURL` is being used in your requests
4. Re-authenticate (run login) when switching environments as tokens are environment-specific

### Environment Variables Best Practices

- Keep environment-specific variables (URLs, API keys) in environment settings
- Use descriptive environment names that clearly indicate the target system
- Regularly clean up unused environments to avoid confusion

## 🔧 Advanced Testing Tips

### Testing Edge Cases

- **Large File Uploads**: Test with files at or near size limits
- **Special Characters**: Use usernames/content with special characters, emojis, or unicode
- **Concurrent Requests**: Test multiple users interacting with the same resources
- **Empty/Null Values**: Test endpoints with missing or null required fields

### Performance Considerations

- Monitor response times for video upload and processing endpoints
- Test pagination with large datasets
- Verify search functionality with various query lengths and special characters

### Data Cleanup

- After testing DELETE operations, verify resources are properly removed
- Consider the order of operations when testing related functionality
- Use consistent test data naming conventions for easy identification

## 📄 Example Request Patterns

### Successful Authentication Response

```json
{
	"statusCode": 200,
	"data": {
		"user": { "id": "...", "username": "testuser" },
		"accessToken": "eyJhbGciOiJIUzI1NiIs...",
		"refreshToken": "eyJhbGciOiJIUzI1NiIs..."
	},
	"message": "User logged In Successfully"
}
```

### Successful Video Upload Response

```json
{
	"statusCode": 200,
	"data": {
		"_id": "video_id_here",
		"title": "Test Video",
		"videoFile": "cloudinary_url_here",
		"thumbnail": "cloudinary_url_here"
	},
	"message": "Video uploaded successfully"
}
```

### Error Response Format

```json
{
	"statusCode": 401,
	"data": null,
	"message": "Invalid or expired access token",
	"success": false
}
```
