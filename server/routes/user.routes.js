const express = require('express');
const { body } = require('express-validator');
const { getAllUsers, updateUserRole, deleteUser } = require('../controllers/user.controller');
const { validate } = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

const router = express.Router();

// All routes here require admin role
router.use(protect, authorizeRoles('admin'));

// ── Admin routes ───────────────────────────────────────────────────────
router.get('/', getAllUsers);

router.put(
  '/:id/role',
  [
    body('role')
      .notEmpty().withMessage('Role is required')
      .isIn(['user', 'admin']).withMessage('Role must be "user" or "admin"'),
  ],
  validate,
  updateUserRole
);

router.delete('/:id', deleteUser);

module.exports = router;
