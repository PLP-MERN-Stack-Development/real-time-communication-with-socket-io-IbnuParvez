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