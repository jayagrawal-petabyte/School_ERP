const authMiddleware = require('./authMiddleware');
const userRoutes = require('./userRoutes');
const userService = require('./userService');
const { studentRoutes } = require('./students');
const { teacherRoutes } = require('./teachers');
const { parentRoutes } = require('./parents');

module.exports = {
  authMiddleware,
  userRoutes,
  userService,
  studentRoutes,
  teacherRoutes,
  parentRoutes,
};
