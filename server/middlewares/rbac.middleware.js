const ApiError = require('../utils/ApiError');
const { ROLES, ROLE_PERMISSIONS } = require('../config/roles');

/**
 * Restricts a route to the given list of roles.
 * Usage: router.get('/', protect, authorize(ROLES.ADMIN, ROLES.HR), handler)
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authorized, please log in'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
};

/**
 * Restricts a route to users whose role grants a specific permission.
 * Super Admin always passes. Usage: permission('manage_payroll')
 */
const permission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authorized, please log in'));
    }
    if (req.user.role === ROLES.SUPER_ADMIN) return next();

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    if (!userPermissions.includes(requiredPermission)) {
      return next(
        new ApiError(403, `You lack the required permission: ${requiredPermission}`)
      );
    }
    next();
  };
};

module.exports = { authorize, permission };
