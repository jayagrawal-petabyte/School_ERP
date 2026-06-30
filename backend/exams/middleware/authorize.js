const AppError = require('../errors/AppError');
const relationshipService = require('../service/relationshipService');

const normalizeStringArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim().toLowerCase());
  return [String(value).trim().toLowerCase()];
};

const normalizeRole = (role) => (role == null ? '' : String(role).trim().toLowerCase());

const checkOwnership = async (user, resourceContext) => {
  if (!resourceContext) {
    return false;
  }

  const role = normalizeRole(user.role);
  const studentId = resourceContext.student_id || resourceContext.studentId;
  const teacherId = resourceContext.teacher_id || resourceContext.teacherId;
  const classId = resourceContext.class_id || resourceContext.classId;

  if (role === 'student') {
    return String(studentId) === String(user.id);
  }

  if (role === 'teacher') {
    if (String(teacherId) === String(user.id)) {
      return true;
    }

    if (Array.isArray(resourceContext.assignedTeacherIds)) {
      return resourceContext.assignedTeacherIds.map((id) => String(id)).includes(String(user.id));
    }

    if (classId) {
      return relationshipService.isTeacherAssignedToClass(user.id, classId);
    }

    return false;
  }

  if (role === 'parent') {
    if (!studentId) {
      return false;
    }

    return relationshipService.isParentOfStudent(user.id, studentId);
  }

  return false;
};

const authorize = ({ roles = [], ownership, requireOwnership = false } = {}) => {
  const allowedRoles = normalizeStringArray(roles);
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
