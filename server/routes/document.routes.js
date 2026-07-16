const express = require('express');
const router = express.Router();

const {
  uploadDocument,
  getDocumentsForEntity,
  deleteDocument,
} = require('../controllers/document.controller');

const protect = require('../middlewares/auth.middleware');
const { uploadDocument: uploadMiddleware } = require('../middlewares/upload.middleware');

router.use(protect);

router.post('/', uploadMiddleware.single('file'), uploadDocument);
router.get('/:relatedKind/:relatedId', getDocumentsForEntity);
router.delete('/:id', deleteDocument);

module.exports = router;
