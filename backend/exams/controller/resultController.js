const resultService = require('../service/resultService');
const resultDto = require('../dto/resultDto');

const sendResponse = (res, statusCode, data) => res.status(statusCode).json({
  success: true,
  data,
});

const createResult = async (req, res) => {
  const result = await resultService.createResult(req.body, req.user);
  return sendResponse(res, 201, resultDto.toResultResponse(result, req.user.role));
};

const updateResult = async (req, res) => {
  const result = await resultService.updateResult(req.params.id, req.body, {
    resourceOwner: req.resourceOwner,
    user: req.user,
  });
  return sendResponse(res, 200, resultDto.toResultResponse(result, req.user.role));
};

const getResultById = async (req, res) => {
  const result = await resultService.getResultById(req.params.id, {
    resourceOwner: req.resourceOwner,
    user: req.user,
  });
  return sendResponse(res, 200, resultDto.toResultResponse(result, req.user.role));
};

const getAllResults = async (req, res) => {
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

  return res.status(200).json(resultDto.toPaginatedResultsResponse(results, req.user.role));
};

const getMyResults = async (req, res) => {
  const results = await resultService.getMyResults(req.user);
  return sendResponse(res, 200, resultDto.toResultsResponse(results, req.user.role));
};

module.exports = {
  createResult,
  updateResult,
  getResultById,
  getAllResults,
  getMyResults,
};
