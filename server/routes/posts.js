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