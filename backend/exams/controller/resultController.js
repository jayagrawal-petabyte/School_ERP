const resultService = require('../service/resultService');
const resultDto = require('../dto/resultDto');

const createResult = async (req, res) => {
  const result = await resultService.createResult(req.body, req.user);
  res.status(201).json({
    success: true,
    data: resultDto.toResultResponse(result, req.user.role),
  });
};

const updateResult = async (req, res) => {
  const result = await resultService.updateResult(req.params.id, req.body);
  res.status(200).json({
    success: true,
    data: resultDto.toResultResponse(result, req.user.role),
  });
};

const getResultById = async (req, res) => {
  const result = await resultService.getResultById(req.params.id);
  res.status(200).json({
    success: true,
    data: resultDto.toResultResponse(result, req.user.role),
  });
};

const getAllResults = async (req, res) => {
  const results = await resultService.getAllResults(req.user);
  res.status(200).json({
    success: true,
    data: resultDto.toResultsResponse(results, req.user.role),
  });
};

const getMyResults = async (req, res) => {
  const results = await resultService.getMyResults(req.user);
  res.status(200).json({
    success: true,
    data: resultDto.toResultsResponse(results, req.user.role),
  });
};

module.exports = {
  createResult,
  updateResult,
  getResultById,
  getAllResults,
  getMyResults,
};
