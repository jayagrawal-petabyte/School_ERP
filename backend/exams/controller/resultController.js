const resultService = require('../service/resultService');
const resultDto = require('../dto/resultDto');

const sendResponse = (res, statusCode, data) => res.status(statusCode).json({
  success: true,
  data,
});

const createResult = async (req, res) => {
  console.log('[Controller] createResult - Request body:', req.body);
  console.log('[Controller] createResult - User:', req.user);
  const result = await resultService.createResult(req.body, req.user);
  console.log('[Controller] createResult - Result created:', result);
  return sendResponse(res, 201, resultDto.toResultResponse(result, req.user.role));
};

const updateResult = async (req, res) => {
  console.log('[Controller] updateResult - ID:', req.params.id);
  console.log('[Controller] updateResult - Request body:', req.body);
  const result = await resultService.updateResult(req.params.id, req.body, {
    resourceOwner: req.resourceOwner,
    user: req.user,
  });
  console.log('[Controller] updateResult - Result updated:', result);
  return sendResponse(res, 200, resultDto.toResultResponse(result, req.user.role));
};

const getResultById = async (req, res) => {
  console.log('[Controller] getResultById - ID:', req.params.id);
  const result = await resultService.getResultById(req.params.id, {
    resourceOwner: req.resourceOwner,
    user: req.user,
  });
  console.log('[Controller] getResultById - Result:', result);
  return sendResponse(res, 200, resultDto.toResultResponse(result, req.user.role));
};

const getAllResults = async (req, res) => {
  console.log('[Controller] getAllResults - Query params:', req.query);
  const results = await resultService.getAllResults(req.user, {
    page: req.query.page,
    limit: req.query.limit,
    sortBy: req.query.sortBy,
    order: req.query.order,
    filters: {
      studentId: req.query.studentId,
      teacherId: req.query.teacherId,
      classId: req.query.classId,
      examId: req.query.examId,
      subjectId: req.query.subjectId,
      status: req.query.status,
    },
  });
  console.log('[Controller] getAllResults - Results count:', results.data?.length || 0);
  return res.status(200).json(resultDto.toPaginatedResultsResponse(results, req.user.role));
};

const getMyResults = async (req, res) => {
  console.log('[Controller] getMyResults - User ID:', req.user.id, 'Role:', req.user.role);
  const results = await resultService.getMyResults(req.user);
  console.log('[Controller] getMyResults - Results count:', results.length || 0);
  return sendResponse(res, 200, resultDto.toResultsResponse(results, req.user.role));
};

module.exports = {
  createResult,
  updateResult,
  getResultById,
  getAllResults,
  getMyResults,
};
