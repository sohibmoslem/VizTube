# VizTube API: Complete Postman Testing Guide

This comprehensive guide provides step-by-step instructions for setting up and using the VizTube API Postman collection. Follow these instructions to test every endpoint in the application, from user registration to advanced dashboard analytics.

## 📋 Prerequisites

Before starting, ensure you have:

- **Postman Desktop App**: Latest version installed on your machine
- **Running VizTube Server**: Backend server must be running locally
  ```bash
  npm run dev
  ```
  Server should be accessible at `http://localhost:8000`

## 🚀 Initial Setup

### Step 1: Import the API Collection

The repository includes a pre-configured Postman collection with all API requests organized by functionality.

1. **Download** the `VizTube.postman_collection.json` file from the repository root
2. **Open Postman** and click the **Import** button (top-left corner)
3. **Drag and drop** the JSON file into the import window
4. **Verify import**: The "VizTube" collection should appear in your workspace with organized folders:
   - 👤 `users` - Authentication and user management
   - 🎥 `videos` - Video CRUD operations
   - 📚 `playlists` - Playlist management
   - 💬 `comments` - Comment system
   - 👍 `likes` - Like/dislike functionality
   - 📊 `dashboard` - Analytics endpoints

### Step 2: Configure Environment Variables

Environment variables streamline testing by managing the base URL and authentication tokens automatically.

1. **Create Environment**:

   - Navigate to **Environments** tab (left sidebar)
   - Click the `+` button to create new environment
   - Name it **"VizTube Local"**

2. **Add Variables**:

   | Variable      | Initial Value                  | Description                |
   | ------------- | ------------------------------ | -------------------------- |
   | `baseURL`     | `http://localhost:8000/api/v1` | API base endpoint          |
   | `accessToken` | _(leave empty)_                | Auto-populated after login |

3. **Activate Environment**:
   - Select **"VizTube Local"** from the environment dropdown (top-right)
   - Ensure it shows as active (not "No Environment")

## 🔐 Authentication Workflow

All protected routes require authentication. Follow this sequence to obtain and use access tokens.

### Step 1: User Registration

1. **Navigate** to `users` folder → `POST register` request
2. **Configure Request Body**:
   - Select **Body** tab
   - Choose **form-data** format
   - Fill required fields:
     ```
     fullName: Your Full Name
     username: your_username
     email: your.email@example.com
     password: your_secure_password
     ```
   - **Upload Files**:
     - `avatar`: Profile image file
     - `coverImage`: Cover image file
3. **Send Request**: Click **Send**
4. **Verify Response**: Should receive `201 Created` status

### Step 2: User Login & Token Acquisition

1. **Open** `POST login` request
2. **Configure Request Body**:
   - Select **Body** tab
   - Choose **raw** → **JSON**
   - Enter login credentials:
     ```json
     {
     	"username": "your_username",
     	"password": "your_secure_password"
     }
     ```
3. **Send Request**: Click **Send**
4. **Automatic Token Capture**:
   - Upon successful `200 OK` response
   - Embedded script automatically extracts `accessToken`
   - Token is saved to `{{accessToken}}` environment variable
   - **No manual copying required**

## 🛡️ Testing Protected Endpoints

All protected endpoints are pre-configured with automatic authentication using the `{{accessToken}}` variable.

### Authentication Configuration

- **Parent Folder Auth**: Set to "Bearer Token" with `{{accessToken}}`
- **Request Auth**: Set to "Inherit auth from parent"
- **Automatic Headers**: Authorization header added automatically

### Testing Workflow

After successful login, you can immediately test any protected endpoint:

1. **User Profile**: `GET current-user-details`
2. **Video Upload**: `POST upload`
3. **Create Playlist**: `POST create-playlist`
4. **Dashboard Stats**: `GET channel-stats`

### 🔧 Troubleshooting Authentication

**Problem**: `401 Unauthorized` - "Invalid or expired access token"

**Solution**:

1. Re-run `POST login` request to refresh token
2. Verify environment is active
3. Check token variable is populated

## 📊 API Endpoint Categories

### 👤 User Management

- **Registration**: Create new user accounts
- **Authentication**: Login/logout functionality
- **Profile**: Update user details, avatar, cover image
- **Password**: Change user passwords

### 🎥 Video Operations

- **Upload**: Post new videos with thumbnails
- **Browse**: Get all videos with pagination
- **Details**: Retrieve specific video information
- **Management**: Update/delete user's videos
- **Search**: Find videos by keywords

### 👍 Social Features

- **Likes**: Toggle likes on videos/comments
- **Comments**: CRUD operations for video comments
- **Subscriptions**: Subscribe/unsubscribe from channels

### 📚 Content Organization

- **Playlists**: Create and manage video collections
- **Categories**: Organize content by topics

### 📊 Analytics & Dashboard

- **Channel Stats**: Views, subscribers, likes count
- **Video Analytics**: Individual video performance
- **User Insights**: Engagement metrics

## 🧪 Testing Best Practices

### Sequential Testing

1. **Start** with user registration
2. **Login** to obtain tokens
3. **Test** user profile endpoints
4. **Upload** test videos
5. **Interact** with social features
6. **Verify** dashboard analytics

### Data Management

- Use consistent test data across requests
- Clean up test content after testing
- Maintain separate test user accounts

### Error Handling

- Test invalid inputs for validation
- Verify proper error responses
- Check authentication edge cases

## 🚨 Common Issues & Solutions

### Server Connection

**Issue**: Connection refused errors
**Solution**: Ensure VizTube server is running on port 8000

### File Uploads

**Issue**: File upload failures
**Solution**:

- Check file sizes (within limits)
- Verify file formats are supported
- Ensure proper form-data encoding

### Token Expiration

**Issue**: Frequent 401 errors
**Solution**:

- Check token expiry settings
- Implement refresh token workflow
- Re-login when tokens expire

## 📝 Advanced Testing Scenarios

### Bulk Operations

- Test pagination limits
- Verify sorting parameters
- Check filter combinations

### Edge Cases

- Test with empty databases
- Verify boundary conditions
- Check concurrent user scenarios

### Performance Testing

- Monitor response times
- Test with large file uploads
- Verify database query efficiency

## 🔄 Environment Management

### Local Development

```
baseURL: http://localhost:8000/api/v1
```

### Staging Environment

```
baseURL: https://viztube-staging.onrender.com/api/v1
```

### Production Testing

```
baseURL: https://viztube.onrender.com/api/v1
```

## 📞 Support & Resources

- **API Documentation**: Refer to main README.md
- **Issue Reporting**: Use GitHub Issues for bugs
- **Collection Updates**: Re-import when API changes
- **Environment Setup**: Verify all variables are configured

---

**💡 Pro Tip**: Use Postman's test scripts and environment variables to create automated test suites for regression testing!
