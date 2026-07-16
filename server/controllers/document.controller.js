const asyncHandler = require('express-async-handler');
const { Document } = require('../models/Misc');
const Employee = require('../models/Employee');
const Client = require('../models/Client');
const Candidate = require('../models/Candidate');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const RELATED_MODELS = { Employee, Client, Candidate };

// @route  POST /api/documents  (multipart/form-data: file, category, relatedKind, relatedId)
const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const { category = 'other', relatedKind, relatedId, name } = req.body;

  const document = await Document.create({
    name: name || req.file.originalname,
    fileUrl: `/uploads/documents/${req.file.filename}`,
    fileType: req.file.mimetype,
    fileSize: req.file.size,
    category,
    uploadedBy: req.user._id,
    relatedTo: relatedKind && relatedId ? { kind: relatedKind, id: relatedId } : undefined,
  });

  // Attach to the owning entity's documents array, and resume field for candidates
  if (relatedKind && relatedId && RELATED_MODELS[relatedKind]) {
    const Model = RELATED_MODELS[relatedKind];
    if (relatedKind === 'Candidate' && category === 'resume') {
      await Model.findByIdAndUpdate(relatedId, { resume: document._id });
    } else {
      await Model.findByIdAndUpdate(relatedId, { $push: { documents: document._id } });
    }
  }

  res.status(201).json(new ApiResponse(201, 'Document uploaded successfully', document));
});

// @route  GET /api/documents/:relatedKind/:relatedId — list documents for an entity
const getDocumentsForEntity = asyncHandler(async (req, res) => {
  const { relatedKind, relatedId } = req.params;
  const documents = await Document.find({ 'relatedTo.kind': relatedKind, 'relatedTo.id': relatedId }).sort(
    '-createdAt'
  );
  res.status(200).json(new ApiResponse(200, 'Documents fetched', documents));
});

const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findByIdAndDelete(req.params.id);
  if (!document) throw new ApiError(404, 'Document not found');
  res.status(200).json(new ApiResponse(200, 'Document deleted'));
});

module.exports = { uploadDocument, getDocumentsForEntity, deleteDocument };
