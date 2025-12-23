# Backend Architecture Specification for MERN Stack Blog Application

## Overview
This document outlines the backend architecture for the MERN stack blog application, focusing on additions and modifications to the existing codebase. The backend will provide RESTful APIs for posts, categories, and user authentication, with proper validation, security, and error handling.

## 1. Database Design and Relationships

### Models

#### User Model (`server/models/User.js`)
```javascript
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include in queries by default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
```

#### Category Model (`server/models/Category.js`)
```javascript
const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a category name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot be more than 50 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot be more than 200 characters']
  }
}, { timestamps: true });

// Create slug from name before saving
CategorySchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  this.slug = this.name
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
  next();
});

module.exports = mongoose.model('Category', CategorySchema);
```

#### Post Model (Existing - `server/models/Post.js`)
- Already implemented with proper relationships to User and Category
- Includes comments array with user references
- Has slug generation and view count methods

### Relationships
- **User** has many **Posts** (author)
- **User** has many **Comments** (via embedded in posts)
- **Category** has many **Posts**
- **Post** belongs to **User** and **Category**
- **Post** has embedded **Comments** referencing **User**

### Indexes
- User: email (unique)
- Category: name (unique), slug (unique)
- Post: slug (unique), category, author, isPublished

## 2. Middleware

### Authentication Middleware (`server/middleware/auth.js`)
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
```

### Validation Middleware (`server/middleware/validation.js`)
Using Joi for input validation:
```javascript
const Joi = require('joi');

// Validation schemas
const postSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  content: Joi.string().min(1).required(),
  category: Joi.string().required(),
  tags: Joi.array().items(Joi.string()),
  isPublished: Joi.boolean()
});

const userSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const categorySchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  description: Joi.string().max(200)
});

// Middleware function
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  };
};

module.exports = { validate, postSchema, userSchema, categorySchema };
```

### File Upload Middleware (`server/middleware/upload.js`)
Using Multer for file uploads:
```javascript
const multer = require('multer');
const path = require('path');

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `post-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;
```

## 3. API Endpoints Structure

### Posts Routes (`server/routes/posts.js`)
```javascript
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { validate, postSchema } = require('../middleware/validation');
const upload = require('../middleware/upload');

const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  addComment,
  searchPosts
} = require('../controllers/posts');

const router = express.Router();

// Public routes
router.get('/', getPosts);
router.get('/search', searchPosts);
router.get('/:idOrSlug', getPost);

// Protected routes
router.post('/', protect, upload.single('featuredImage'), validate(postSchema), createPost);
router.put('/:id', protect, authorize('admin'), upload.single('featuredImage'), validate(postSchema), updatePost);
router.delete('/:id', protect, authorize('admin'), deletePost);

// Comments
router.post('/:id/comments', protect, addComment);

module.exports = router;
```

### Categories Routes (`server/routes/categories.js`)
```javascript
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { validate, categorySchema } = require('../middleware/validation');

const {
  getCategories,
  createCategory
} = require('../controllers/categories');

const router = express.Router();

// Public routes
router.get('/', getCategories);

// Protected routes
router.post('/', protect, authorize('admin'), validate(categorySchema), createCategory);

module.exports = router;
```

### Authentication Routes (`server/routes/auth.js`)
```javascript
const express = require('express');
const { validate, userSchema } = require('../middleware/validation');

const {
  register,
  login
} = require('../controllers/auth');

const router = express.Router();

// Public routes
router.post('/register', validate(userSchema), register);
router.post('/login', login);

module.exports = router;
```

## 4. API Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "count": 10
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

## 5. Error Handling and Security Considerations

### Error Handling
- Centralized error handling middleware in `server.js`
- Custom error classes for different error types
- Proper HTTP status codes
- Detailed error messages in development, generic in production

### Security Measures
- **Authentication**: JWT tokens with expiration
- **Authorization**: Role-based access control
- **Input Validation**: Joi schemas for all inputs
- **Password Security**: Bcrypt hashing, minimum length requirements
- **File Upload Security**: File type and size restrictions
- **Rate Limiting**: Implement rate limiting for API endpoints
- **CORS**: Configured for cross-origin requests
- **Helmet**: Security headers
- **Data Sanitization**: Prevent XSS and injection attacks
- **Environment Variables**: Sensitive data in env files

### Additional Security Features
- Password reset functionality (optional advanced feature)
- Account lockout after failed login attempts
- Input sanitization middleware
- CSRF protection if needed

## 6. Dependencies to Add

Add to `server/package.json`:
```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "joi": "^17.6.0",
    "jsonwebtoken": "^9.0.0",
    "multer": "^1.4.5-lts.1",
    "helmet": "^6.0.0",
    "express-rate-limit": "^6.7.0"
  }
}
```

## 7. Environment Variables

Add to `.env`:
```
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
MONGODB_URI=mongodb://localhost:27017/mern-blog
NODE_ENV=development
```

## 8. File Structure Additions

```
server/
├── controllers/
│   ├── auth.js
│   ├── posts.js
│   └── categories.js
├── middleware/
│   ├── auth.js
│   ├── validation.js
│   └── upload.js
├── models/
│   ├── User.js (new)
│   ├── Category.js (new)
│   └── Post.js (existing)
├── routes/
│   ├── auth.js (new)
│   ├── posts.js (new)
│   └── categories.js (new)
├── uploads/ (directory for file uploads)
└── server.js (update with additional middleware)
```

This specification provides a complete blueprint for implementing the backend. The existing `Post.js` model and `server.js` structure can be leveraged, with the new components integrated seamlessly.