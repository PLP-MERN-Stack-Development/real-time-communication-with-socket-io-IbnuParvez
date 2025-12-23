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