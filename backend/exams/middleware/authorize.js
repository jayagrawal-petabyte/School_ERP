const AppError = require('../errors/AppError');
const relationshipService = require('../service/relationshipService');
const AUTH_MESSAGES = require('../../auth/constants/authMessages');
const ROLES = require('../constants/roles');

const normalizeRole = (role) => (role == null ? '' : String(role).trim().toLowerCase());

const checkOwnership = async (user, resourceContext) => {
  if (!resourceContext) {
    return false;
  }

  const role = normalizeRole(user.role);
  const studentId = resourceContext.student_id || resourceContext.studentId;
  const teacherId = resourceContext.teacher_id || resourceContext.teacherId;
  const classId = resourceContext.class_id || resourceContext.classId;

  // Admin and principal bypass ownership checks entirely and retain full access.
  if (role === ROLES.ADMIN || role === ROLES.PRINCIPAL) {
    return true;
  }

  if (role === ROLES.STUDENT) {
    return String(studentId) === String(user.id);
  }

  if (role === ROLES.TEACHER) {
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

  if (role === ROLES.PARENT) {
    if (!studentId) {
      return false;
    }

    return relationshipService.isParentOfStudent(user.id, studentId);
  }

  return false;
};

const authorize = ({ ownership, requireOwnership = false } = {}) => {
  const ownershipConfig = ownership === true
    ? { enabled: true }
    : (ownership || (requireOwnership ? { enabled: true } : {}));

  return async (req, res, next) => {
    console.log('[Authorize] Checking authorization for user:', req.user?.id, 'Role:', req.user?.role);
    
    if (!req.user || !req.user.role) {
      console.warn('[Authorize] Missing user or role');
      return res.status(401).json({
        success: false,
        message: AUTH_MESSAGES.UNAUTHORIZED,
      });
    }

    if (ownershipConfig.enabled) {
      try {
        console.log('[Authorize] Checking ownership...');
        const resourceContext = ownershipConfig.resolver
          ? await ownershipConfig.resolver(req)
          : (ownershipConfig.param ? req.params?.[ownershipConfig.param] : null);

        if (!resourceContext) {
          console.warn('[Authorize] Resource context not found');
          return next(new AppError('Resource not found.', 404));
        }

        console.log('[Authorize] Resource context obtained:', resourceContext);
        // Reuse the fetched result context in the service layer to avoid duplicate lookups.
        req.resourceOwner = resourceContext;

        const isOwner = await checkOwnership(req.user, resourceContext);
        console.log('[Authorize] Ownership check result:', isOwner);
        
        if (!isOwner) {
          console.warn('[Authorize] User is not the owner');
          return next(new AppError(AUTH_MESSAGES.FORBIDDEN, 403));
        }
      } catch (error) {
        console.error('[Authorize] Authorization error:', error);
        return next(error);
      }
    }

    console.log('[Authorize] Authorization passed');
    return next();
  };
};

module.exports = authorize;
