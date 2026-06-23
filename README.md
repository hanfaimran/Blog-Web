# BlogWeb

A production-ready Full-Stack Blog Platform built with React (Vite), TailwindCSS, Node.js, Express, and MongoDB.

## Features
- **Authentication**: Secure JWT-based authentication with access and refresh tokens stored in HTTP-only cookies.
- **Role-Based Access Control**: `user` and `admin` roles. Admins have full access and can manage users.
- **Rich Text Editor**: Integrated `react-quill` for writing and formatting blog posts.
- **SEO Optimized**: Dynamic meta tags and titles using `react-helmet-async`, plus automatic slug generation.
- **Security**: Password hashing with bcrypt, input validation & sanitization, rate-limiting, and Helmet.js.
- **Dynamic Design**: Custom TailwindCSS configuration with vibrant themes, dark mode support, glassmorphism, and micro-animations.
- **RESTful API**: Structured error handling, pagination, and search/filtering capabilities.

## Tech Stack
- **Frontend**: React.js (Vite), React Router v6, Axios, TailwindCSS v4.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB, Mongoose.

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or MongoDB Atlas URL)

### Environment Setup
Create a `.env` file in the root directory based on `.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/blogweb
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret
CLIENT_URL=http://localhost:5173
```

### Installation

1. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```
2. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```

### Running the Application

1. Start the backend server (runs on `http://localhost:5000`):
   ```bash
   cd server
   npm run dev
   ```
2. Start the frontend development server (runs on `http://localhost:5173`):
   ```bash
   cd client
   npm run dev
   ```

## API Endpoints Reference

### Auth Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive cookies
- `POST /api/auth/logout` - Clear cookies
- `POST /api/auth/refresh` - Rotate refresh token & get new access token
- `GET /api/auth/me` - Get current authenticated user

### Blog Routes
- `GET /api/blogs` - Get all published blogs (Public)
- `GET /api/blogs/slug/:slug` - Get a single blog and increment views (Public)
- `POST /api/blogs` - Create a new blog post (Protected)
- `PUT /api/blogs/:id` - Update a blog post (Protected/Ownership)
- `DELETE /api/blogs/:id` - Delete a blog post (Protected/Ownership)
- `GET /api/blogs/my/posts` - Get posts by the logged-in user (Protected)

### Admin Routes (Protected + Admin Role)
- `GET /api/blogs/admin/all` - Get all blogs across all users
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update a user's role
- `DELETE /api/admin/users/:id` - Delete a user
