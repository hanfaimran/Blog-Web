const express = require('express');
const { body } = require('express-validator');
const {
  getPublishedBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  getMyBlogs,
  adminGetAllBlogs,
  getBlogForEdit,
} = require('../controllers/blog.controller');
const { validate } = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

const router = express.Router();

// ── Validation chains ──────────────────────────────────────────────────
const blogValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 120 }).withMessage('Title must be 3–120 characters'),
  body('content')
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
  body('tags')
    .optional()
    .isArray({ max: 5 }).withMessage('Tags must be an array with at most 5 items'),
  body('tags.*')
    .optional()
    .isString().withMessage('Each tag must be a string')
    .trim(),
  body('status')
    .optional()
    .isIn(['draft', 'published']).withMessage('Status must be "draft" or "published"'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Excerpt cannot exceed 300 characters'),
  body('coverImage')
    .optional()
    .trim(),
];

const blogUpdateValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 120 }).withMessage('Title must be 3–120 characters'),
  body('content')
    .optional()
    .isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
  body('tags')
    .optional()
    .isArray({ max: 5 }).withMessage('Tags must be an array with at most 5 items'),
  body('tags.*')
    .optional()
    .isString().withMessage('Each tag must be a string')
    .trim(),
  body('status')
    .optional()
    .isIn(['draft', 'published']).withMessage('Status must be "draft" or "published"'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Excerpt cannot exceed 300 characters'),
  body('coverImage')
    .optional()
    .trim(),
];

// ── Public routes ──────────────────────────────────────────────────────
router.get('/', getPublishedBlogs);
router.get('/slug/:slug', getBlogBySlug);

// ── Protected routes (any authenticated user) ──────────────────────────
router.get('/my/posts', protect, getMyBlogs);
router.get('/:id/edit', protect, getBlogForEdit);
router.post('/', protect, blogValidation, validate, createBlog);
router.put('/:id', protect, blogUpdateValidation, validate, updateBlog);
router.delete('/:id', protect, deleteBlog);

// ── Admin routes ───────────────────────────────────────────────────────
router.get('/admin/all', protect, authorizeRoles('admin'), adminGetAllBlogs);

module.exports = router;
