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