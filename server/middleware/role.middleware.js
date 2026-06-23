const AppError = require('../utils/AppError');

/**
 * Role-based authorization middleware.
 * Must be used AFTER the protect middleware (requires req.user).
 *
 * Usage:  router.get('/admin', protect, authorizeRoles('admin'), controller)
 *
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'user').
 * @returns {Function} Express middleware.
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Role '${req.user.role}' is not authorized to access this resource.`,
          403
        )
      );
    }

    next();
  };
};

module.exports = { authorizeRoles };
