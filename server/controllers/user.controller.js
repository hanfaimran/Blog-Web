const User = require('../models/User.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// ────────────────────────────────────────────────────────────────────────
// GET /api/admin/users — Admin: list all users
// ────────────────────────────────────────────────────────────────────────
const getAllUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
    message: 'Users retrieved successfully.',
  });
});

// ────────────────────────────────────────────────────────────────────────
// PUT /api/admin/users/:id/role — Admin: update user role
// ────────────────────────────────────────────────────────────────────────
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    throw new AppError('Role must be either "user" or "admin".', 400);
  }

  // Prevent admin from demoting themselves
  if (req.params.id === req.user._id.toString()) {
    throw new AppError('You cannot change your own role.', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  res.status(200).json({
    success: true,
    data: { user },
    message: `User role updated to '${role}'.`,
  });
});

// ────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/users/:id — Admin: delete user
// ────────────────────────────────────────────────────────────────────────
const deleteUser = asyncHandler(async (req, res) => {
  // Prevent self-deletion
  if (req.params.id === req.user._id.toString()) {
    throw new AppError('You cannot delete your own account from admin panel.', 400);
  }

  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  res.status(200).json({
    success: true,
    data: null,
    message: 'User deleted successfully.',
  });
});

module.exports = { getAllUsers, updateUserRole, deleteUser };
