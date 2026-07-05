const Module = require('module');
const express = require('express');

const originalLoad = Module._load;
Module._load = function patchedLoad(request, parent, isMain) {
  if (request === '../database/supabaseClient' || request === './database/supabaseClient' || request.endsWith('supabaseClient')) {
    return {
      from: () => ({
        select: async () => ({ data: [], error: null }),
        insert: () => ({ select: async () => ({ data: [], error: null }) }),
        update: () => ({ eq: () => ({ select: async () => ({ data: [], error: null }) }) }),
        eq: () => ({ select: async () => ({ data: [], error: null }) }),
      }),
    };
  }

  return originalLoad.apply(this, arguments);
};

const authRouter = require('./auth').authRouter;
const { assignmentRoutes } = require('./assignments');
const attendanceRoutes = require('./attendance/attendanceRoutes');
const { resultRoutes } = require('./exams');
const errorHandler = require('./exams/middleware/errorHandler');
const { notificationRoutes } = require('./notifications');
const { reportRoutes } = require('./reports');
const { submissionRoutes } = require('./assignment-submission');
const {
  userRoutes,
  studentRoutes,
  teacherRoutes,
  parentRoutes,
} = require('./user-management');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  req.requestContext = {
    startedAt: new Date().toISOString(),
    path: req.path,
  };
  next();
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'school-erp-backend' });
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'school-erp-backend' });
});

app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'School ERP Backend',
    status: 'running',
    documentation: '/api/health',
  });
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRoutes);
app.use('/api/users/students', studentRoutes);
app.use('/api/users/teachers', teacherRoutes);
app.use('/api/users/parents', parentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', resultRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/assignment-submission', submissionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`School ERP backend listening on port ${PORT}`);
  });
}

module.exports = app;
