const AppError = require('../errors/AppError');
const relationshipService = require('../service/relationshipService');

const normalizeStringArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim().toLowerCase());
  return [String(value).trim().toLowerCase()];
};

const normalizeRole = (role) => (role == null ? '' : String(role).trim().toLowerCase());

const hasRequiredPermissions = (user, requiredPermissions) => {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  if (!user || !user.role) {
    return false;
  }

  const userRole = normalizeRole(user.role);
  if (userRole === 'admin' || userRole === 'principal') {
    return true;
  }

  const userPermissions = Array.isArray(user.permissions)
    ? user.permissions.map((permission) => normalizeRole(permission))
    : [];

  return requiredPermissions.every((permission) => userPermissions.includes(permission));
};

const checkOwnership = async (user, resourceContext) => {
  if (!resourceContext) {
    return false;
  }

  const role = normalizeRole(user.role);

  if (role === 'student') {
    return String(resourceContext.studentId) === String(user.id);
  }

  if (role === 'teacher') {
    if (String(resourceContext.teacherId) === String(user.id)) {
      return true;
    }

    if (Array.isArray(resourceContext.assignedTeacherIds)) {
      return resourceContext.assignedTeacherIds.map((id) => String(id)).includes(String(user.id));
    }

    return false;
  }

  if (role === 'parent') {
    if (!resourceContext.studentId) {
      return false;
    }

    return relationshipService.isParentOfStudent(user.id, resourceContext.studentId);
  }

  return false;
};

const authorize = ({ roles = [], permissions = [], ownership, requireOwnership = false } = {}) => {
  const allowedRoles = normalizeStringArray(roles);
  const requiredPermissions = normalizeStringArray(permissions);
  const ownershipConfig = ownership === true
    ? { enabled: true }
    : (ownership || (requireOwnership ? { enabled: true } : {}));

  return async (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication required.',
        details: {},
      });
    }

    const userRole = normalizeRole(req.user.role);
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient role privileges.',
        details: {},
      });
    }

    if (!hasRequiredPermissions(req.user, requiredPermissions)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient permissions.',
        details: {},
      });
    }

    if (ownershipConfig.enabled) {
      try {
        const resourceContext = ownershipConfig.resolver
          ? await ownershipConfig.resolver(req)
          : (ownershipConfig.param ? req.params?.[ownershipConfig.param] : null);

        if (!resourceContext) {
          return next(new AppError('Resource not found.', 404));
        }

        const isOwner = await checkOwnership(req.user, resourceContext);
        if (!isOwner) {
          return next(new AppError('Forbidden: You do not have ownership of this resource.', 403));
        }

        req.resourceOwner = resourceContext;
      } catch (error) {
        return next(error);
      }
    }

    return next();
  };
};

module.exports = authorize;
