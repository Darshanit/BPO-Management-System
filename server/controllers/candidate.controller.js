const asyncHandler = require('express-async-handler');
const Candidate = require('../models/Candidate');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const APIFeatures = require('../utils/apiFeatures');

// @route  GET /api/recruitment — returns candidates grouped by pipeline stage
const getCandidates = asyncHandler(async (req, res) => {
  const baseQuery = Candidate.find().populate('department', 'name');
  const features = new APIFeatures(baseQuery, req.query)
    .filter()
    .search(['name', 'email', 'positionAppliedFor'])
    .sort();

  const candidates = await features.query;

  const board = { applied: [], screening: [], interview: [], offered: [], hired: [], rejected: [] };
  candidates.forEach((c) => board[c.status]?.push(c));

  res.status(200).json(new ApiResponse(200, 'Candidates fetched', board));
});

const getCandidateById = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findById(req.params.id)
    .populate('department', 'name')
    .populate('resume')
    .populate('notes.author', 'name');
  if (!candidate) throw new ApiError(404, 'Candidate not found');
  res.status(200).json(new ApiResponse(200, 'Candidate fetched', candidate));
});

const createCandidate = asyncHandler(async (req, res) => {
  const candidate = await Candidate.create({ ...req.body, addedBy: req.user._id });
  res.status(201).json(new ApiResponse(201, 'Candidate added to pipeline', candidate));
});

const updateCandidate = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!candidate) throw new ApiError(404, 'Candidate not found');
  res.status(200).json(new ApiResponse(200, 'Candidate updated', candidate));
});

// @route  PATCH /api/recruitment/:id/stage — move to a different pipeline stage
const moveStage = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const candidate = await Candidate.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!candidate) throw new ApiError(404, 'Candidate not found');
  res.status(200).json(new ApiResponse(200, 'Candidate stage updated', candidate));
});

// @route  POST /api/recruitment/:id/notes
const addNote = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findById(req.params.id);
  if (!candidate) throw new ApiError(404, 'Candidate not found');

  candidate.notes.push({ author: req.user._id, text: req.body.text });
  await candidate.save();

  res.status(201).json(new ApiResponse(201, 'Note added', candidate.notes));
});

const deleteCandidate = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findByIdAndDelete(req.params.id);
  if (!candidate) throw new ApiError(404, 'Candidate not found');
  res.status(200).json(new ApiResponse(200, 'Candidate removed from pipeline'));
});

module.exports = {
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  moveStage,
  addNote,
  deleteCandidate,
};
