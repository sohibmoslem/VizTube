# VizTube - Video Streaming Platform Backend

**A full-featured video streaming platform backend built with Node.js, Express, and MongoDB**

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

🌐 **Live API:** [https://viztube.onrender.com](https://viztube.onrender.com)

[Features](#-features) • [Tech Stack](#️-tech-stack) • [Installation](#️-installation--setup) • [API Documentation](#-api-documentation--testing) • [Deployment](#-deployment) • [Contributing](#-contributing)

---

## 📖 Overview

VizTube is a comprehensive video streaming platform backend that enables users to upload, share, and discover videos with rich social features. Built with modern technologies and best practices, it provides a scalable foundation for building video-sharing applications similar to YouTube.

## ✨ Features

### 🔐 Authentication & Security

- **Secure Registration & Login**: JWT-based authentication system
- **Dual Token Strategy**: Access tokens and refresh tokens for enhanced security
- **HTTP-Only Cookies**: Secure session management
- **Password Encryption**: Bcrypt hashing for user passwords

### 🎥 Video Management

- **Full CRUD Operations**: Create, read, update, and delete videos
- **Cloud Storage**: Seamless integration with Cloudinary for video and thumbnail storage
- **Advanced Search**: MongoDB Atlas Search with pagination and sorting

### 👥 Social Features

- **User Subscriptions**: Subscribe to channels and manage subscriptions
- **Interactive Likes**: Polymorphic like system for videos, comments, and tweets
- **Comment System**: Full CRUD operations for comments on videos
- **Micro-blogging**: Tweet-like short content sharing feature

### 📚 Content Organization

- **Personal Playlists**: Create, manage, and organize video collections
- **Channel Management**: User profiles with avatar and cover image support

### 📊 Analytics & Dashboard

- **User Analytics**: Comprehensive statistics including views, likes, and subscribers
- **Content Insights**: Track video performance and engagement metrics

## 🛠️ Tech Stack

| Category           | Technology                |
| ------------------ | ------------------------- |
| **Runtime**        | Node.js                   |
| **Framework**      | Express.js                |
| **Database**       | MongoDB with Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT)     |
| **File Upload**    | Multer                    |
| **Cloud Storage**  | Cloudinary                |
| **Validation**     | express-validator         |
| **Environment**    | dotenv                    |

## ⚙️ Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB Atlas** account or local MongoDB instance
- **Cloudinary** account for media storage

### 1. Clone the Repository

```bash
git clone https://github.com/Nishant-444/viztube.git
cd viztube
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory and configure the variables as specified in the `.env.example` file.

### 4. Start the Application

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:8000`

## 📋 API Documentation & Testing

A comprehensive Postman collection is included for API testing. Please follow the detailed instructions in the **Postman API Testing Guide** to set up the environment and test all endpoints.

### Key API Endpoints

#### 🔐 Authentication

- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout
- `POST /api/users/refresh-token` - Refresh access token

#### 🎥 Video Management

- `GET /api/videos` - Get all videos
- `POST /api/videos` - Upload a new video
- `GET /api/videos/:id` - Get video by ID
- `PUT /api/videos/:id` - Update video details
- `DELETE /api/videos/:id` - Delete video

#### 👥 Social Features

- `POST /api/likes/toggle/:videoId` - Toggle like on video
- `POST /api/comments` - Add comment to video
- `GET /api/comments/:videoId` - Get video comments
- `POST /api/subscriptions/toggle/:channelId` - Toggle subscription

#### 📚 Playlists

- `GET /api/playlists` - Get user playlists
- `POST /api/playlists` - Create new playlist
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist

#### 📊 Dashboard

- `GET /api/dashboard/stats` - Get channel statistics
- `GET /api/dashboard/videos` - Get user's videos

## 🚀 Deployment

This application is **production-ready** and has been deployed on **Render**.

### Live API Endpoint

The live API is available at the following base URL. You can use this URL in Postman to interact with the deployed application:

**🌐 Base URL:** `https://viztube.onrender.com`

### Environment Setup for Production

Before deploying, ensure you set the following environment variables on your hosting service:

- **`NODE_ENV`**: Set this to `production`. This is critical for performance and security optimizations in Express.
- **`CORS_ORIGIN`**: For security, change this from `*` to the specific domain of your frontend application (e.g., `https://my-viztube-frontend.com`).
- **Secrets**: Ensure all your `MONGODB_URI`, JWT secrets, and Cloudinary keys are securely set in the environment variables section of your deployment platform.

### Example: Deploying on Render

Render is a modern cloud platform that makes it easy to deploy Node.js applications directly from a GitHub repository.

1. **Push your code** to a GitHub repository.

2. **Create a New Web Service** on Render:

   - Log in to your Render account and click "New" → "Web Service"
   - Connect your GitHub account and select your `viztube` repository

3. **Configure the Service**:

   - **Name**: Give your service a name (e.g., `viztube-api`)
   - **Region**: Choose a region close to your users
   - **Branch**: Select your main branch (e.g., `master` or `main`)
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`

4. **Add Environment Variables**:

   - Go to the "Environment" tab
   - Add all the variables from your `.env` file one by one. This is a crucial step to ensure your application has access to its secrets.

5. **Deploy**:
   - Click "Create Web Service". Render will automatically pull your code, build the project, and deploy it.
   - Your API will be live at the URL provided by Render (e.g., `https://viztube-api.onrender.com`)

### Other Deployment Options

- **Heroku**: Easy deployment with Git integration
- **DigitalOcean**: VPS deployment with PM2
- **AWS**: EC2 or Elastic Beanstalk deployment
- **Vercel**: Serverless deployment option

## 🔧 Key Features Implementation

### 📤 File Upload System

- **Multer Integration**: Handles multipart/form-data for video and image uploads
- **Cloudinary Storage**: Automatic upload to cloud storage with optimized delivery
- **File Validation**: Type and size restrictions for uploaded content

### 🔒 Authentication Flow

- **JWT Strategy**: Separate access and refresh tokens for enhanced security
- **Cookie-based Sessions**: HTTP-only cookies prevent XSS attacks
- **Token Refresh**: Automatic token renewal for seamless user experience

### ✅ Data Validation

- **express-validator**: Comprehensive input validation and sanitization
- **Custom Validators**: Business logic validation for complex scenarios
- **Error Handling**: Detailed validation error responses

### 🛡️ Error Management

- **Centralized Handling**: Custom `ApiError` class for consistent error responses
- **Async Wrapper**: `asyncHandler` utility to catch and forward async errors
- **Structured Responses**: Standardized `ApiResponse` format

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style and structure
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the **MIT License**.

## 🐛 Issues & Support

- **Bug Reports**: [GitHub Issues](https://github.com/Nishant-444/viztube/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/Nishant-444/viztube/discussions)

## 📞 Contact

- **GitHub**: [@Nishant-444](https://github.com/Nishant-444)
- **Project Link**: [VizTube Repository](https://github.com/Nishant-444/viztube)

---

**⭐ If you found this project helpful, please give it a star on GitHub! ⭐**

Made with ❤️ for the developer community
